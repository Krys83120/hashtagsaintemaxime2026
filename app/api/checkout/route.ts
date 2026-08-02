import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createSumupCheckout } from "@/lib/sumup";
import type { CartItem } from "@/lib/store/cart";

export async function POST(request: Request) {
  const body = await request.json();
  const items: CartItem[] = body.items || [];
  const customer = body.customer || {};

  if (items.length === 0) {
    return NextResponse.json({ error: "Le panier est vide." }, { status: 400 });
  }
  if (!customer.email || !customer.name || !customer.address) {
    return NextResponse.json({ error: "Informations client incomplètes." }, { status: 400 });
  }

  // Si le client est connecté, on relie la commande à son compte (facultatif : achat invité toujours possible)
  const serverSupabase = await createServerClient();
  const { data: { user } } = await serverSupabase.auth.getUser();

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping = subtotal >= 60 ? 0 : 4.9;

  const admin = createAdminClient();

  // On revalide le code promo côté serveur : jamais confiance dans une réduction envoyée par le client
  let discount = 0;
  let promoCode: string | null = null;
  if (body.promoCode) {
    const { data: promo } = await admin
      .from("promo_codes")
      .select("*")
      .eq("code", String(body.promoCode).trim().toUpperCase())
      .eq("active", true)
      .maybeSingle();

    if (promo && (!promo.expires_at || new Date(promo.expires_at) > new Date())
      && (!promo.usage_limit || promo.usage_count < promo.usage_limit)
      && subtotal >= (promo.min_order_amount || 0)) {

      let alreadyUsedByCustomer = false;
      if (promo.one_per_customer) {
        const { data: usage } = await admin
          .from("promo_code_usage")
          .select("id")
          .eq("promo_code_id", promo.id)
          .eq("customer_email", String(customer.email).trim().toLowerCase())
          .maybeSingle();
        alreadyUsedByCustomer = !!usage;
      }

      if (!alreadyUsedByCustomer) {
        discount = promo.discount_type === "percent"
          ? Math.round(subtotal * (promo.discount_value / 100) * 100) / 100
          : Math.min(promo.discount_value, subtotal);
        promoCode = promo.code;
        await admin.from("promo_codes").update({ usage_count: (promo.usage_count || 0) + 1 }).eq("id", promo.id);
        if (promo.one_per_customer) {
          await admin.from("promo_code_usage").insert({
            promo_code_id: promo.id,
            customer_email: String(customer.email).trim().toLowerCase(),
          });
        }
      }
    }
  }

  const total = Math.max(0, Math.round((subtotal + shipping - discount) * 100) / 100);

  const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "";
  const orderNumber = `SM-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;

  // On enregistre la commande en "pending" AVANT de rediriger vers SumUp,
  // pour avoir le détail complet (articles, adresse) dès la confirmation.
  const { error: insertError } = await admin.from("orders").insert({
    order_number: orderNumber,
    customer_id: user?.id || null,
    customer_name: customer.name,
    customer_email: customer.email,
    customer_address: {
      ...customer.address,
      formatted: [customer.address.line1, customer.address.postalCode, customer.address.city].filter(Boolean).join(", "),
    },
    items: items.map((i) => ({ name: i.name, qty: i.quantity, price: i.price, color: i.color, size: i.size })),
    total,
    promo_code: promoCode,
    discount_amount: discount,
    status: "pending",
    payment_method: "sumup",
  });

  if (insertError) {
    return NextResponse.json({ error: "Erreur d'enregistrement : " + insertError.message }, { status: 500 });
  }

  try {
    const checkout = await createSumupCheckout({
      checkoutReference: orderNumber,
      amount: total,
      description: `Commande #SAINTEMAXIME ${orderNumber}`,
      redirectUrl: `${origin}/commande-confirmee/?ref=${orderNumber}`,
    });

    if (!checkout.hosted_checkout_url) {
      throw new Error("SumUp n'a pas renvoyé d'URL de paiement.");
    }

    // On mémorise l'ID SumUp pour pouvoir vérifier le vrai statut du paiement à la confirmation
    await admin.from("orders").update({ notes: `sumup_id:${checkout.id}` }).eq("order_number", orderNumber);

    return NextResponse.json({ url: checkout.hosted_checkout_url });
  } catch (err: any) {
    // On annule la commande en attente si le paiement n'a pas pu être initié
    await admin.from("orders").update({ status: "cancelled" }).eq("order_number", orderNumber);
    return NextResponse.json({ error: err.message || "Erreur SumUp." }, { status: 500 });
  }
}

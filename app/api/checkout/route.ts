import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
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

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping = subtotal >= 60 ? 0 : 4.9;
  const total = Math.round((subtotal + shipping) * 100) / 100;

  const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "";
  const orderNumber = `SM-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;

  const admin = createAdminClient();

  // On enregistre la commande en "pending" AVANT de rediriger vers SumUp,
  // pour avoir le détail complet (articles, adresse) dès la confirmation.
  const { error: insertError } = await admin.from("orders").insert({
    order_number: orderNumber,
    customer_name: customer.name,
    customer_email: customer.email,
    customer_address: {
      ...customer.address,
      formatted: [customer.address.line1, customer.address.postalCode, customer.address.city].filter(Boolean).join(", "),
    },
    items: items.map((i) => ({ name: i.name, qty: i.quantity, price: i.price, color: i.color, size: i.size })),
    total,
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

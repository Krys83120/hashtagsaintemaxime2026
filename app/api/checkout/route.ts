import { NextResponse } from "next/server";
import Stripe from "stripe";
import type { CartItem } from "@/lib/store/cart";

export async function POST(request: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json(
      { error: "Le paiement n'est pas encore configuré (STRIPE_SECRET_KEY manquante)." },
      { status: 400 }
    );
  }

  const stripe = new Stripe(secretKey);

  const body = await request.json();
  const items: CartItem[] = body.items || [];
  const customer = body.customer || {};

  if (items.length === 0) {
    return NextResponse.json({ error: "Le panier est vide." }, { status: 400 });
  }
  if (!customer.email || !customer.name || !customer.address) {
    return NextResponse.json({ error: "Informations client incomplètes." }, { status: 400 });
  }

  const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "";

  const line_items = items.map((item) => ({
    price_data: {
      currency: "eur",
      product_data: {
        name: item.name + (item.color || item.size ? ` (${[item.color, item.size].filter(Boolean).join(", ")})` : ""),
        images: item.image?.startsWith("http") ? [item.image] : undefined,
      },
      unit_amount: Math.round(item.price * 100),
    },
    quantity: item.quantity,
  }));

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shippingCost = subtotal >= 60 ? 0 : 4.9;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: customer.email,
      line_items: shippingCost > 0
        ? [
            ...line_items,
            {
              price_data: {
                currency: "eur",
                product_data: { name: "Frais de livraison" },
                unit_amount: Math.round(shippingCost * 100),
              },
              quantity: 1,
            },
          ]
        : line_items,
      success_url: `${origin}/commande-confirmee/?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/commande-annulee/`,
      metadata: {
        customer_name: customer.name,
        customer_email: customer.email,
        customer_address: JSON.stringify(customer.address),
        items: JSON.stringify(
          items.map((i) => ({ name: i.name, qty: i.quantity, price: i.price, color: i.color, size: i.size }))
        ),
        total_items: String(totalItems),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Erreur Stripe." }, { status: 500 });
  }
}

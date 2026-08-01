import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secretKey || !webhookSecret) {
    return NextResponse.json({ error: "Stripe non configuré." }, { status: 400 });
  }

  const stripe = new Stripe(secretKey);
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature!, webhookSecret);
  } catch (err: any) {
    return NextResponse.json({ error: `Signature invalide : ${err.message}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 100 });
      const items = lineItems.data.map((li) => ({
        name: li.description,
        qty: li.quantity,
        price: (li.amount_total || 0) / 100 / (li.quantity || 1),
      }));

      let address: any = {};
      try {
        address = JSON.parse(session.metadata?.customer_address || "{}");
      } catch {
        // ignore parse error, garde un objet vide
      }
      const formattedAddress = [address.line1, address.postalCode, address.city]
        .filter(Boolean)
        .join(", ");

      const admin = createAdminClient();
      const orderNumber = `SM-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;

      const { error } = await admin.from("orders").insert({
        order_number: orderNumber,
        customer_name: session.metadata?.customer_name || session.customer_details?.name || "Client",
        customer_email: session.customer_email || session.customer_details?.email || "",
        customer_address: { ...address, formatted: formattedAddress },
        items,
        total: (session.amount_total || 0) / 100,
        status: "paid",
        payment_method: "stripe",
        notes: `Stripe session: ${session.id}`,
      });

      if (error) {
        console.error("Erreur insertion commande:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    } catch (err: any) {
      console.error("Erreur traitement webhook:", err.message);
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}

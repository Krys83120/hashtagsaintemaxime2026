import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendReviewRequestEmail } from "@/lib/email";

// Route appelée automatiquement chaque jour par Vercel Cron (voir vercel.json).
// Protégée par un secret pour éviter que n'importe qui puisse la déclencher.
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const admin = createAdminClient();

  const tenDaysAgo = new Date();
  tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
  const elevenDaysAgo = new Date();
  elevenDaysAgo.setDate(elevenDaysAgo.getDate() - 11);

  const { data: orders, error } = await admin
    .from("orders")
    .select("*")
    .eq("status", "delivered")
    .eq("review_email_sent", false)
    .not("delivered_at", "is", null)
    .lte("delivered_at", tenDaysAgo.toISOString())
    .gte("delivered_at", elevenDaysAgo.toISOString());

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const results: { order: string; status: "sent" | "error" }[] = [];

  for (const order of orders || []) {
    try {
      const items = (order.items || []).map((i: any) => ({ name: i.name }));
      await sendReviewRequestEmail({
        to: order.customer_email,
        customerName: order.customer_name,
        orderNumber: order.order_number,
        items,
      });
      await admin.from("orders").update({ review_email_sent: true }).eq("id", order.id);
      results.push({ order: order.order_number, status: "sent" });
    } catch (err: any) {
      console.error(`Erreur envoi avis pour ${order.order_number}:`, err.message);
      results.push({ order: order.order_number, status: "error" });
    }
  }

  return NextResponse.json({ checked: orders?.length || 0, results });
}

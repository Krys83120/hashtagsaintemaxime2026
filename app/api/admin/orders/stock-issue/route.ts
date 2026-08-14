import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireActiveAdmin() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, status: 401, message: "Non authentifié." };

  const { data: profile } = await supabase
    .from("admin_users")
    .select("active")
    .eq("id", user.id)
    .single();

  if (!profile || !profile.active) {
    return { ok: false as const, status: 403, message: "Accès admin requis." };
  }
  return { ok: true as const };
}

export async function POST(request: Request) {
  const check = await requireActiveAdmin();
  if (!check.ok) return NextResponse.json({ error: check.message }, { status: check.status });

  const { orderId, itemIndex, action, note } = await request.json();
  if (!orderId || itemIndex === undefined || !["mark", "unmark"].includes(action)) {
    return NextResponse.json({ error: "Paramètres invalides." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: order, error: orderError } = await admin
    .from("orders")
    .select("stock_issues")
    .eq("id", orderId)
    .maybeSingle();

  if (orderError || !order) {
    return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });
  }

  let issues: { itemIndex: number; note?: string }[] = order.stock_issues || [];
  issues = issues.filter((i) => i.itemIndex !== itemIndex);
  if (action === "mark") {
    issues.push({ itemIndex, note: note || "" });
  }

  const { error: updateError } = await admin.from("orders").update({ stock_issues: issues }).eq("id", orderId);
  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, stockIssues: issues });
}

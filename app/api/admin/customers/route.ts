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

export async function GET() {
  const check = await requireActiveAdmin();
  if (!check.ok) return NextResponse.json({ error: check.message }, { status: check.status });

  const admin = createAdminClient();

  const [{ data: authUsers }, { data: adminRows }, { data: orders }] = await Promise.all([
    admin.auth.admin.listUsers({ perPage: 1000 }),
    admin.from("admin_users").select("id"),
    admin.from("orders").select("customer_id, customer_name, customer_email, total, created_at"),
  ]);

  const adminIds = new Set((adminRows || []).map((a) => a.id));
  const customers = (authUsers?.users || []).filter((u) => !adminIds.has(u.id));

  const ordersByCustomer: Record<string, { count: number; total: number; lastOrderAt: string }> = {};
  (orders || []).forEach((o: any) => {
    if (!o.customer_id) return;
    if (!ordersByCustomer[o.customer_id]) {
      ordersByCustomer[o.customer_id] = { count: 0, total: 0, lastOrderAt: o.created_at };
    }
    ordersByCustomer[o.customer_id].count += 1;
    ordersByCustomer[o.customer_id].total += Number(o.total);
    if (o.created_at > ordersByCustomer[o.customer_id].lastOrderAt) {
      ordersByCustomer[o.customer_id].lastOrderAt = o.created_at;
    }
  });

  const result = customers.map((u) => ({
    id: u.id,
    email: u.email,
    fullName: (u.user_metadata as any)?.full_name || "",
    phone: (u.user_metadata as any)?.phone || "",
    createdAt: u.created_at,
    emailConfirmed: !!u.email_confirmed_at,
    ordersCount: ordersByCustomer[u.id]?.count || 0,
    totalSpent: ordersByCustomer[u.id]?.total || 0,
  }));

  return NextResponse.json({ customers: result });
}

export async function DELETE(request: Request) {
  const check = await requireActiveAdmin();
  if (!check.ok) return NextResponse.json({ error: check.message }, { status: check.status });

  const { id } = await request.json();
  if (!id) {
    return NextResponse.json({ error: "id requis." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}

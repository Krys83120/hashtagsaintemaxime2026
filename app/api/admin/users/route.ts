import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireSuperadmin() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false as const, status: 401, message: "Non authentifié." };

  const { data: profile } = await supabase
    .from("admin_users")
    .select("role, active")
    .eq("id", user.id)
    .single();

  if (!profile || !profile.active || profile.role !== "superadmin") {
    return { ok: false as const, status: 403, message: "Réservé aux superadmins." };
  }

  return { ok: true as const, userId: user.id };
}

export async function POST(request: Request) {
  const check = await requireSuperadmin();
  if (!check.ok) {
    return NextResponse.json({ error: check.message }, { status: check.status });
  }

  const { email, password, fullName, role } = await request.json();

  if (!email || !password || !role) {
    return NextResponse.json({ error: "Email, mot de passe et rôle sont requis." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Le mot de passe doit faire au moins 8 caractères." }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createError || !created.user) {
    return NextResponse.json({ error: createError?.message || "Création impossible." }, { status: 400 });
  }

  const { error: profileError } = await admin.from("admin_users").insert({
    id: created.user.id,
    email,
    full_name: fullName || null,
    role,
    active: true,
  });

  if (profileError) {
    // Rollback : évite un compte Auth orphelin sans profil admin_users
    await admin.auth.admin.deleteUser(created.user.id);
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }

  return NextResponse.json({ id: created.user.id, email, role });
}

export async function DELETE(request: Request) {
  const check = await requireSuperadmin();
  if (!check.ok) {
    return NextResponse.json({ error: check.message }, { status: check.status });
  }

  const { id } = await request.json();
  if (!id) {
    return NextResponse.json({ error: "id requis." }, { status: 400 });
  }
  if (id === check.userId) {
    return NextResponse.json({ error: "Tu ne peux pas supprimer ton propre compte." }, { status: 400 });
  }

  const admin = createAdminClient();

  await admin.from("admin_users").delete().eq("id", id);
  const { error: deleteError } = await admin.auth.admin.deleteUser(id);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

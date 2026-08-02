import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateProductDescription, generateProductDetails } from "@/lib/product-description-generator";

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

  const { overwriteAll } = await request.json().catch(() => ({ overwriteAll: false }));

  const admin = createAdminClient();
  const { data: products, error: fetchError } = await admin
    .from("products")
    .select("id, name, category, categories, colors, sizes, description, details");

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  const isGenericDescription = (desc: string, name: string) =>
    !desc ||
    desc.trim() === "" ||
    desc.trim() === `${name} — Produit officiel #SAINTEMAXIME.`;

  const results: { name: string; status: "updated" | "skipped" }[] = [];

  for (const product of products || []) {
    const needsUpdate = overwriteAll || isGenericDescription(product.description, product.name);
    if (!needsUpdate) {
      results.push({ name: product.name, status: "skipped" });
      continue;
    }

    const description = generateProductDescription(product);
    const details = product.details?.length && !overwriteAll ? product.details : generateProductDetails(product);

    const { error: updateError } = await admin
      .from("products")
      .update({ description, details })
      .eq("id", product.id);

    if (!updateError) {
      results.push({ name: product.name, status: "updated" });
    }
  }

  const updatedCount = results.filter((r) => r.status === "updated").length;
  return NextResponse.json({ total: products?.length || 0, updated: updatedCount, results });
}

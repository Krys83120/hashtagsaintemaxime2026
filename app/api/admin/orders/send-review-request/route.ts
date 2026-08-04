import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendReviewRequestEmail } from "@/lib/email";

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

  const { orderId } = await request.json();
  if (!orderId) {
    return NextResponse.json({ error: "orderId manquant." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: order, error: orderError } = await admin
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();

  if (orderError || !order) {
    return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });
  }

  const allItems: { name: string; slug?: string; productId?: string }[] = (order.items || []).map((i: any) => ({
    name: i.name,
    slug: i.slug,
    productId: i.productId,
  }));

  // Si on connaît le compte client ET les productId de la commande (commandes récentes),
  // on ne garde que les articles qu'il n'a pas encore évalués.
  let itemsToReview = allItems;
  if (order.customer_id && allItems.some((i) => i.productId)) {
    const productIds = allItems.map((i) => i.productId).filter(Boolean);
    const { data: existingReviews } = await admin
      .from("reviews")
      .select("product_id")
      .eq("user_id", order.customer_id)
      .in("product_id", productIds);

    const reviewedProductIds = new Set((existingReviews || []).map((r: any) => r.product_id));
    itemsToReview = allItems.filter((i) => !i.productId || !reviewedProductIds.has(i.productId));
  }

  if (itemsToReview.length === 0) {
    return NextResponse.json({ alreadyReviewed: true, message: "Ce client a déjà évalué tous les articles de cette commande." });
  }

  try {
    await sendReviewRequestEmail({
      to: order.customer_email,
      customerName: order.customer_name,
      orderNumber: order.order_number,
      orderDate: new Date(order.created_at).toLocaleDateString("fr-FR"),
      items: itemsToReview,
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Erreur d'envoi : " + err.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, itemsSent: itemsToReview.length, totalItems: allItems.length });
}

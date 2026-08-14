import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendShippingEmail, sendPartialShipmentEmail } from "@/lib/email";

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

  const { orderId, itemIndexes, trackingNumber, carrier } = await request.json();

  if (!orderId || !Array.isArray(itemIndexes) || itemIndexes.length === 0 || !trackingNumber || !carrier) {
    return NextResponse.json({ error: "Informations manquantes." }, { status: 400 });
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

  const allItems: any[] = order.items || [];
  const existingShipments: any[] = order.shipments || [];

  // Indexes déjà expédiés lors d'un envoi précédent
  const alreadyShippedIndexes = new Set(existingShipments.flatMap((s: any) => s.itemIndexes || []));

  const newlyShippedIndexes = itemIndexes.filter((i: number) => !alreadyShippedIndexes.has(i));
  if (newlyShippedIndexes.length === 0) {
    return NextResponse.json({ error: "Ces articles ont déjà été expédiés." }, { status: 400 });
  }

  const newShipment = {
    id: `ship_${Date.now()}`,
    itemIndexes: newlyShippedIndexes,
    trackingNumber,
    carrier,
    shippedAt: new Date().toISOString(),
  };
  const updatedShipments = [...existingShipments, newShipment];

  const allShippedIndexes = new Set(updatedShipments.flatMap((s: any) => s.itemIndexes || []));
  const isComplete = allItems.every((_, idx) => allShippedIndexes.has(idx));
  const newStatus = isComplete ? "shipped" : "partially_shipped";

  const { error: updateError } = await admin
    .from("orders")
    .update({
      shipments: updatedShipments,
      status: newStatus,
      tracking_number: trackingNumber, // reflète le dernier envoi pour compatibilité avec l'existant
      carrier,
      shipped_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "";
  const trackingUrl = `${origin}/suivi/${order.tracking_token}/`;

  try {
    if (isComplete && existingShipments.length === 0) {
      // Cas simple : tout part en une seule fois, comme avant
      await sendShippingEmail({
        to: order.customer_email,
        customerName: order.customer_name,
        orderNumber: order.order_number,
        trackingNumber,
        carrier,
        trackingUrl,
      });
    } else {
      const shippedItems = newlyShippedIndexes.map((i: number) => ({ name: allItems[i].name, qty: allItems[i].qty }));
      const stockIssueIndexes = new Set((order.stock_issues || []).map((si: any) => si.itemIndex));
      const pendingItems = allItems
        .map((item, idx) => ({ item, idx }))
        .filter(({ idx }) => !allShippedIndexes.has(idx))
        .map(({ item, idx }) => ({ name: item.name, qty: item.qty, outOfStock: stockIssueIndexes.has(idx) }));

      await sendPartialShipmentEmail({
        to: order.customer_email,
        customerName: order.customer_name,
        orderNumber: order.order_number,
        shippedItems,
        pendingItems,
        trackingNumber,
        carrier,
        trackingUrl,
        isFinalShipment: isComplete,
      });
    }
  } catch (err: any) {
    console.error("Erreur envoi email expédition:", err.message);
  }

  return NextResponse.json({ ok: true, status: newStatus, isComplete });
}

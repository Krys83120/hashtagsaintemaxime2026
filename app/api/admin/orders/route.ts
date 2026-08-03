import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendShippingEmail, sendProcessingEmail } from "@/lib/email";

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

export async function PATCH(request: Request) {
  const check = await requireActiveAdmin();
  if (!check.ok) return NextResponse.json({ error: check.message }, { status: check.status });

  const body = await request.json();
  const { orderId, status, trackingNumber, carrier } = body;

  if (!orderId) {
    return NextResponse.json({ error: "orderId requis." }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: order, error: fetchError } = await admin
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (fetchError || !order) {
    return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });
  }

  const updates: Record<string, any> = {};
  if (status) updates.status = status;
  if (trackingNumber !== undefined) updates.tracking_number = trackingNumber;
  if (carrier !== undefined) updates.carrier = carrier;

  const willTriggerShippingEmail =
    status === "shipped" &&
    order.status !== "shipped" && // évite de renvoyer l'email si déjà marquée expédiée
    (trackingNumber || order.tracking_number);

  const willTriggerProcessingEmail =
    status === "processing" &&
    order.status !== "processing" &&
    !order.processing_email_sent;

  if (willTriggerShippingEmail) {
    updates.shipped_at = new Date().toISOString();
  }
  if (willTriggerProcessingEmail) {
    updates.processing_email_sent = true;
  }
  if (status === "delivered" && order.status !== "delivered") {
    updates.delivered_at = new Date().toISOString();
  }

  const { error: updateError } = await admin.from("orders").update(updates).eq("id", orderId);
  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "";

  if (willTriggerProcessingEmail) {
    try {
      await sendProcessingEmail({
        to: order.customer_email,
        customerName: order.customer_name,
        orderNumber: order.order_number,
        trackingUrl: `${origin}/suivi/${order.tracking_token}/`,
      });
    } catch (err: any) {
      console.error("Erreur envoi email preparation:", err.message);
    }
  }

  if (willTriggerShippingEmail) {
    try {
      await sendShippingEmail({
        to: order.customer_email,
        customerName: order.customer_name,
        orderNumber: order.order_number,
        trackingNumber: trackingNumber || order.tracking_number,
        carrier: carrier || order.carrier || "Colissimo",
        trackingUrl: `${origin}/suivi/${order.tracking_token}/`,
      });
    } catch (err: any) {
      console.error("Erreur envoi email expédition:", err.message);
      // On ne bloque pas la mise à jour de la commande si l'email échoue
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const check = await requireActiveAdmin();
  if (!check.ok) return NextResponse.json({ error: check.message }, { status: check.status });

  const { orderId } = await request.json();
  if (!orderId) {
    return NextResponse.json({ error: "orderId requis." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin.from("orders").delete().eq("id", orderId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

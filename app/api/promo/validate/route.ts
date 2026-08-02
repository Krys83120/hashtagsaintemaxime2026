import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const { code, subtotal } = await request.json();

  if (!code) {
    return NextResponse.json({ error: "Code manquant." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: promo } = await supabase
    .from("promo_codes")
    .select("*")
    .eq("code", code.trim().toUpperCase())
    .eq("active", true)
    .maybeSingle();

  if (!promo) {
    return NextResponse.json({ error: "Code promo invalide." }, { status: 404 });
  }
  if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
    return NextResponse.json({ error: "Ce code promo a expiré." }, { status: 400 });
  }
  if (promo.usage_limit && promo.usage_count >= promo.usage_limit) {
    return NextResponse.json({ error: "Ce code promo a atteint sa limite d'utilisation." }, { status: 400 });
  }
  if (promo.min_order_amount && subtotal < promo.min_order_amount) {
    return NextResponse.json(
      { error: `Ce code nécessite un minimum de ${promo.min_order_amount}€ d'achat.` },
      { status: 400 }
    );
  }

  const discount = promo.discount_type === "percent"
    ? Math.round(subtotal * (promo.discount_value / 100) * 100) / 100
    : Math.min(promo.discount_value, subtotal);

  return NextResponse.json({
    code: promo.code,
    discountType: promo.discount_type,
    discountValue: promo.discount_value,
    discount,
  });
}

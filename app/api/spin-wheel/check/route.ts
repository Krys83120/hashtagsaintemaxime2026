import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}

export async function GET(request: Request) {
  const admin = createAdminClient();

  const { data: settingsRow } = await admin
    .from("site_settings")
    .select("value")
    .eq("key", "spin_wheel_config")
    .maybeSingle();

  const config = (settingsRow?.value as any) || {};
  if (config.enabled === false) {
    return NextResponse.json({ allowed: false });
  }

  const frequencyDays = config.frequencyDays ?? 7;
  const ip = getClientIp(request);

  if (ip === "unknown") {
    // Impossible d'identifier l'IP (environnement local, etc.) : on autorise par défaut
    return NextResponse.json({ allowed: true });
  }

  const { data: existing } = await admin
    .from("spin_wheel_impressions")
    .select("last_shown_at")
    .eq("ip", ip)
    .maybeSingle();

  const now = new Date();
  if (existing) {
    const last = new Date(existing.last_shown_at);
    const diffDays = (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays < frequencyDays) {
      return NextResponse.json({ allowed: false });
    }
  }

  await admin.from("spin_wheel_impressions").upsert({ ip, last_shown_at: now.toISOString() });
  return NextResponse.json({ allowed: true });
}

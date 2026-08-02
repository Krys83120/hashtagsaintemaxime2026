import { createClient } from "@/lib/supabase/server";
import type { SiteLink } from "@/lib/links-types";

export async function getSiteLinks(): Promise<SiteLink[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("links")
      .select("label, url, type, active")
      .eq("active", true)
      .order("sort_order", { ascending: true });

    return (data || []).map((l: any) => ({ label: l.label, url: l.url, section: l.type }));
  } catch {
    return [];
  }
}

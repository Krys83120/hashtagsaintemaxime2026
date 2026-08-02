import { createClient } from "@/lib/supabase/server";

export interface SiteLink {
  label: string;
  url: string;
  section: string;
}

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

export function linksBySection(links: SiteLink[], section: string): SiteLink[] {
  return links.filter((l) => l.section === section);
}

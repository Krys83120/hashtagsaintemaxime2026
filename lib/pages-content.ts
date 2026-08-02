import { createClient } from "@/lib/supabase/server";

export async function getPageContent<T = any>(pageKey: string): Promise<T | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("pages_content")
      .select("content")
      .eq("page_key", pageKey)
      .maybeSingle();

    return (data?.content as T) || null;
  } catch {
    return null;
  }
}

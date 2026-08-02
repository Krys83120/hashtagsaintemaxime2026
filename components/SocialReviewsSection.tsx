import { createClient } from "@/lib/supabase/server";
import TagembedFeed from "@/components/TagembedFeed";

async function getWidgetIds() {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "site_config")
      .maybeSingle();

    const value = (data?.value as any) || {};
    return {
      googleReviewsWidgetId: value.googleReviewsWidgetId || "",
      facebookWidgetId: value.facebookWidgetId || "",
    };
  } catch {
    return { googleReviewsWidgetId: "", facebookWidgetId: "" };
  }
}

export default async function SocialReviewsSection() {
  const { googleReviewsWidgetId, facebookWidgetId } = await getWidgetIds();

  if (!googleReviewsWidgetId && !facebookWidgetId) return null;

  return (
    <section className="py-16 px-4 max-w-6xl mx-auto">
      <h2 className="text-2xl sm:text-3xl font-bold text-sm-dark text-center mb-10">
        Ce qu'on dit de nous
      </h2>

      <div className={`grid gap-10 ${googleReviewsWidgetId && facebookWidgetId ? "lg:grid-cols-2" : ""}`}>
        {googleReviewsWidgetId && (
          <div>
            <h3 className="font-semibold text-sm-gray text-sm uppercase tracking-wider mb-4 text-center">Avis Google</h3>
            <TagembedFeed widgetId={googleReviewsWidgetId} />
          </div>
        )}
        {facebookWidgetId && (
          <div>
            <h3 className="font-semibold text-sm-gray text-sm uppercase tracking-wider mb-4 text-center">Facebook</h3>
            <TagembedFeed widgetId={facebookWidgetId} />
          </div>
        )}
      </div>
    </section>
  );
}

import { createClient } from "@/lib/supabase/server";
import TrustindexWidget from "@/components/TrustindexWidget";

async function getWidgetCodes() {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "site_config")
      .maybeSingle();

    const value = (data?.value as any) || {};
    return {
      googleReviewsWidgetCode: value.googleReviewsWidgetCode || "",
      facebookWidgetCode: value.facebookWidgetCode || "",
    };
  } catch {
    return { googleReviewsWidgetCode: "", facebookWidgetCode: "" };
  }
}

export default async function SocialReviewsSection() {
  const { googleReviewsWidgetCode, facebookWidgetCode } = await getWidgetCodes();

  if (!googleReviewsWidgetCode && !facebookWidgetCode) return null;

  return (
    <section className="py-16 px-4 max-w-6xl mx-auto">
      <h2 className="text-2xl sm:text-3xl font-bold text-sm-dark text-center mb-10">
        Ce qu'on dit de nous
      </h2>

      <div className={`grid gap-10 ${googleReviewsWidgetCode && facebookWidgetCode ? "lg:grid-cols-2" : ""}`}>
        {googleReviewsWidgetCode && (
          <div>
            <h3 className="font-semibold text-sm-gray text-sm uppercase tracking-wider mb-4 text-center">Avis Google</h3>
            <TrustindexWidget widgetCode={googleReviewsWidgetCode} />
          </div>
        )}
        {facebookWidgetCode && (
          <div>
            <h3 className="font-semibold text-sm-gray text-sm uppercase tracking-wider mb-4 text-center">Facebook</h3>
            <TrustindexWidget widgetCode={facebookWidgetCode} />
          </div>
        )}
      </div>
    </section>
  );
}

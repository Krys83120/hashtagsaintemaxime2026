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
      googleReviewsWidgetCode2: value.googleReviewsWidgetCode2 || "",
      facebookWidgetCode: value.facebookWidgetCode || "",
    };
  } catch {
    return { googleReviewsWidgetCode: "", googleReviewsWidgetCode2: "", facebookWidgetCode: "" };
  }
}

export default async function SocialReviewsSection() {
  const { googleReviewsWidgetCode, googleReviewsWidgetCode2, facebookWidgetCode } = await getWidgetCodes();
  const hasGoogle = !!googleReviewsWidgetCode || !!googleReviewsWidgetCode2;

  if (!hasGoogle && !facebookWidgetCode) return null;

  return (
    <section className="py-16 px-4 max-w-6xl mx-auto">
      <h2 className="text-2xl sm:text-3xl font-bold text-sm-dark text-center mb-10">
        Ce qu'on dit de nous
      </h2>

      <div className={`grid gap-10 ${hasGoogle && facebookWidgetCode ? "lg:grid-cols-2" : ""}`}>
        {hasGoogle && (
          <div className="space-y-8">
            <h3 className="font-semibold text-sm-gray text-sm uppercase tracking-wider text-center">Avis Google</h3>
            {googleReviewsWidgetCode && <TrustindexWidget widgetCode={googleReviewsWidgetCode} />}
            {googleReviewsWidgetCode2 && <TrustindexWidget widgetCode={googleReviewsWidgetCode2} />}
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

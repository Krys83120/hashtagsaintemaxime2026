import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hashtagsaintemaxime.fr";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/compte/", "/checkout/", "/commande-confirmee/", "/commande-annulee/", "/suivi/"],
      },
      // Crawlers des moteurs de réponse IA (GEO) : autorisés explicitement sur le contenu public
      { userAgent: "GPTBot", allow: "/", disallow: ["/admin/", "/api/", "/compte/", "/checkout/"] },
      { userAgent: "ClaudeBot", allow: "/", disallow: ["/admin/", "/api/", "/compte/", "/checkout/"] },
      { userAgent: "PerplexityBot", allow: "/", disallow: ["/admin/", "/api/", "/compte/", "/checkout/"] },
      { userAgent: "Google-Extended", allow: "/" },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

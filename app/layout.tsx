import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TopBar from "@/components/TopBar";
import HeartLoader from "@/components/HeartLoader";
import TrustBadge from "@/components/TrustBadge";
import { getSiteLinks } from "@/lib/links";
import { getPageContent } from "@/lib/pages-content";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  style: ["italic"],
});

export const metadata: Metadata = {
  title: "#SAINTEMAXIME® | Boutique Officielle & Souvenirs Sainte-Maxime Été 2026",
  description:
    "Découvre la marque officielle #SAINTEMAXIME : vêtements, accessoires et souvenirs uniques de Sainte-Maxime. Édition limitée été 2026. Livraison offerte dès 60€.",
  keywords: [
    "souvenirs sainte maxime",
    "cadeau sainte maxime",
    "boutique sainte maxime",
    "t shirt sainte maxime",
    "marque sainte maxime",
    "hashtagsaintemaxime",
    "côte d'azur souvenirs",
  ],
  authors: [{ name: "#SAINTEMAXIME" }],
  creator: "#SAINTEMAXIME",
  publisher: "#SAINTEMAXIME",
  metadataBase: new URL("https://hashtagsaintemaxime.fr"),
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://hashtagsaintemaxime.fr",
    siteName: "#SAINTEMAXIME",
    title: "#SAINTEMAXIME | La Marque Officielle de Sainte-Maxime",
    description:
      "Vêtements, accessoires & souvenirs uniques estampillés #SAINTEMAXIME. Édition été 2026.",
    images: [
      {
        url: "/og-home-2026.jpg",
        width: 1200,
        height: 630,
        alt: "#SAINTEMAXIME – Boutique Officielle",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "#SAINTEMAXIME | La Marque Officielle de Sainte-Maxime",
    description:
      "Vêtements, accessoires & souvenirs uniques de Sainte-Maxime. Découvre la collection été 2026.",
    images: ["/og-home-2026.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://hashtagsaintemaxime.fr",
  },
  verification: {
    google: "VOTRE_CODE_VERIFICATION_GOOGLE", // À remplacer
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const links = await getSiteLinks();
  const homeContent = await getPageContent<{ bannerText?: string; bannerActive?: boolean }>("home");

  return (
    <html lang="fr" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "#SAINTEMAXIME",
              alternateName: "Hashtag Sainte Maxime",
              url: "https://hashtagsaintemaxime.fr",
              logo: "https://hashtagsaintemaxime.fr/logo-saintemaxime.png",
              foundingDate: "2019",
              description:
                "La marque officielle #SAINTEMAXIME propose des vêtements, accessoires et souvenirs uniques estampillés de la ville de Sainte-Maxime.",
              sameAs: [
                "https://www.instagram.com/hashtag_saintemaxime/",
                "https://www.facebook.com/hashtagsaintemaxime/",
              ],
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "customer service",
                email: "contact@hashtagsaintemaxime.fr",
                availableLanguage: "French",
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              url: "https://hashtagsaintemaxime.fr",
              name: "#SAINTEMAXIME – Boutique Officielle",
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: "https://hashtagsaintemaxime.fr/boutique/?s={search_term_string}",
                },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </head>
      <body className="font-sans antialiased bg-white text-sm-dark">
        <HeartLoader />
        <TopBar text={homeContent?.bannerText} active={homeContent?.bannerActive ?? true} />
        <Header links={links} />
        <main>{children}</main>
        <Footer links={links} />
        <TrustBadge />
      </body>
    </html>
  );
}

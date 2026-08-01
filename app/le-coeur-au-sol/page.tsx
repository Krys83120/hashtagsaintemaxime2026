import { Metadata } from "next";
import Image from "next/image";
import TagembedFeed from "@/components/TagembedFeed";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Le Cœur au Sol #SAINTEMAXIME® | Spot Instagrammable | Guide & Concours 2026",
  description:
    "Trouve le cœur #SAINTEMAXIME au sol à Sainte-Maxime. Prends ta photo, partage avec #SAINTEMAXIME et gagne -15% + un kit été. Guide complet.",
};

async function getTagembedWidgetId(): Promise<string> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "site_config")
      .maybeSingle();

    const fromDb = (data?.value as any)?.tagembedWidgetId;
    if (fromDb) return fromDb;
  } catch {
    // ignore, on retombe sur la variable d'environnement
  }
  return process.env.NEXT_PUBLIC_TAGEMBED_WIDGET_ID || "";
}

export default async function CoeurAuSolPage() {
  const tagembedWidgetId = await getTagembedWidgetId();

  return (
    <div className="min-h-screen bg-sm-cream">
      <div className="bg-gradient-to-b from-sm-coral to-sm-cyan py-20 px-4 text-center">
        <span className="text-6xl mb-4 block">❤️</span>
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
          Le Cœur au Sol
        </h1>
        <p className="text-white/90 max-w-2xl mx-auto text-lg">
          L'expérience Instagrammable de Sainte-Maxime. Trouve-le, photographie-le, partage-le.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16 space-y-16">
        <section className="text-center">
          <h2 className="text-3xl font-bold text-sm-deep mb-6">Comment ça marche ?</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <div className="text-4xl mb-4">📍</div>
              <h3 className="font-bold text-xl text-sm-dark mb-2">1. Trouve le Cœur</h3>
              <p className="text-sm-gray">Le cœur #SAINTEMAXIME est peint au sol dans une rue piétonne de Sainte-Maxime.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <div className="text-4xl mb-4">📸</div>
              <h3 className="font-bold text-xl text-sm-dark mb-2">2. Prends ta Photo</h3>
              <p className="text-sm-gray">Pose devant le cœur et prends ta meilleure photo. Sois créatif(ve) !</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <div className="text-4xl mb-4">🎁</div>
              <h3 className="font-bold text-xl text-sm-dark mb-2">3. Gagne ta Récompense</h3>
              <p className="text-sm-gray">Partage sur Instagram avec #SAINTEMAXIME et gagne -15% + un tirage au sort.</p>
            </div>
          </div>
        </section>

        <section className="bg-white p-8 rounded-2xl shadow-sm">
          <h2 className="text-2xl font-bold text-sm-deep mb-4">🎰 Le Concours du Mois</h2>
          <p className="text-sm-dark mb-4">
            Chaque mois, le plus bel été gagne un <strong>Kit Complet #SAINTEMAXIME</strong> d'une valeur de 150€ :
          </p>
          <ul className="space-y-2 mb-6">
            <li className="flex items-center gap-2 text-sm-dark"><span className="text-sm-cyan">✓</span> T-Shirt #SAINTEMAXIME</li>
            <li className="flex items-center gap-2 text-sm-dark"><span className="text-sm-cyan">✓</span> Casquette Trucker</li>
            <li className="flex items-center gap-2 text-sm-dark"><span className="text-sm-cyan">✓</span> Serviette de Plage</li>
            <li className="flex items-center gap-2 text-sm-dark"><span className="text-sm-cyan">✓</span> Mug Officiel</li>
            <li className="flex items-center gap-2 text-sm-dark"><span className="text-sm-cyan">✓</span> Bracelet Silicone</li>
          </ul>
          <a
            href="https://www.instagram.com/hashtag_saintemaxime/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-gradient-to-r from-sm-coral to-sm-cyan text-white font-bold px-8 py-3 rounded-full hover:opacity-90 transition-opacity"
          >
            Participer sur Instagram
          </a>
        </section>

        <section className="text-center">
          <h2 className="text-2xl font-bold text-sm-deep mb-4">Galerie UGC</h2>
          <p className="text-sm-gray mb-8">
            Les plus belles photos partagées avec <strong className="text-sm-cyan">#SAINTEMAXIME</strong>
          </p>

          {/* Photo officielle du cœur, toujours affichée */}
          <div className="max-w-xs mx-auto aspect-square rounded-xl overflow-hidden relative mb-8">
            <Image
              src="/images/coeur-au-sol.jpg"
              alt="Le cœur #SAINTEMAXIME peint au sol à Sainte-Maxime"
              fill
              sizes="320px"
              className="object-cover"
            />
          </div>

          {/* Flux Instagram réel via Tagembed (ID réglable depuis l'admin > SEO & Config > Réseaux Sociaux) */}
          {tagembedWidgetId ? (
            <TagembedFeed widgetId={tagembedWidgetId} />
          ) : (
            <p className="text-sm text-sm-gray bg-white rounded-xl p-6 border border-dashed border-sm-lightgray">
              Le flux Instagram sera bientôt connecté ici — en attendant, sois parmi les premiers à partager ta photo avec #SAINTEMAXIME !
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

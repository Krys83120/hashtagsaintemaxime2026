import { Metadata } from "next";

export const metadata: Metadata = {
  title: "La Marque #SAINTEMAXIME® | Histoire, Valeurs & Lifestyle | Depuis 2019",
  description:
    "#SAINTEMAXIME est une marque déposée depuis 2019. Découvre notre histoire, nos valeurs et notre engagement pour le style Côte d'Azur. Devenez ambassadeur.",
};

export default function LaMarquePage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gradient-to-b from-sm-cyan to-sm-deep py-20 px-4 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
          La Marque #SAINTEMAXIME
        </h1>
        <p className="text-white/80 max-w-2xl mx-auto text-lg">
          Depuis 2019, on célèbre le style de vie du Golfe de Saint-Tropez.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16 space-y-16">
        <section>
          <h2 className="text-3xl font-bold text-sm-deep mb-6">Notre Histoire</h2>
          <p className="text-sm-dark leading-relaxed mb-4">
            La Marque <strong>#SAINTEMAXIME</strong> est déposée depuis 2019. Le Site Officiel de la Marque a été créé dans le but de rassembler et vous proposer des Produits Uniques estampillés de la Marque, représentants la ville de Sainte Maxime.
          </p>
          <p className="text-sm-dark leading-relaxed">
            Vous y trouverez de nombreux produits Souvenirs <strong>#saintemaxime</strong> : Vêtements Homme & Femmes, Accessoires, produits de plage, et du quotidien. Serviettes de plage à vos couleurs préférées, Coques de Téléphones, Coussins, Vêtements Hommes et Femmes, Bracelets en Silicone.
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-sm-deep mb-6">Nos Valeurs</h2>
          <div className="grid sm:grid-cols-2 gap-8">
            <div className="bg-sm-cream p-6 rounded-2xl">
              <h3 className="font-bold text-xl text-sm-cyan mb-2">🏖️ Local First</h3>
              <p className="text-sm-dark">Tous nos designs sont inspirés de Sainte-Maxime et du Golfe de Saint-Tropez. On célèbre le local.</p>
            </div>
            <div className="bg-sm-cream p-6 rounded-2xl">
              <h3 className="font-bold text-xl text-sm-coral mb-2">💎 Qualité Premium</h3>
              <p className="text-sm-dark">Impression DTG haute définition, matériaux soignés, finitions impeccables. On ne fait pas dans l'à peu près.</p>
            </div>
            <div className="bg-sm-cream p-6 rounded-2xl">
              <h3 className="font-bold text-xl text-sm-cyan mb-2">📸 Instagrammable</h3>
              <p className="text-sm-dark">Nos produits sont faits pour être vus, partagés, aimés. Le cœur au sol est notre emblème.</p>
            </div>
            <div className="bg-sm-cream p-6 rounded-2xl">
              <h3 className="font-bold text-xl text-sm-coral mb-2">🤝 Communauté</h3>
              <p className="text-sm-dark">La #SAINTEMAXIME Family est notre plus grande fierté. Rejoins-nous et deviens ambassadeur.</p>
            </div>
          </div>
        </section>

        <section className="bg-sm-cream p-8 rounded-2xl text-center">
          <h2 className="text-2xl font-bold text-sm-deep mb-4">Deviens Ambassadeur</h2>
          <p className="text-sm-dark mb-6">
            Tu aimes la marque et tu veux la représenter ? Nous acceptons les partenariats et les revendeurs. Contacte-nous pour en savoir plus.
          </p>
          <a
            href="mailto:contact@hashtagsaintemaxime.fr"
            className="inline-block bg-sm-cyan text-white font-bold px-8 py-3 rounded-full hover:bg-sm-deep transition-colors"
          >
            Nous Contacter
          </a>
        </section>
      </div>
    </div>
  );
}

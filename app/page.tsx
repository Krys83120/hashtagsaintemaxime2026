import { Metadata } from "next";
import Hero from "@/components/Hero";
import CategoryCard from "@/components/CategoryCard";
import ProductCard from "@/components/ProductCard";
import UGCChallenge from "@/components/UGCChallenge";
import Newsletter from "@/components/Newsletter";
import SpinWheel from "@/components/SpinWheel";
import { getCategories, getAllProducts } from "@/lib/products";
import { Star, Truck, Shield, RefreshCw } from "lucide-react";

export const metadata: Metadata = {
  title: "#SAINTEMAXIME® | Boutique Officielle & Souvenirs Sainte-Maxime Été 2026",
  description:
    "Découvre la marque officielle #SAINTEMAXIME : vêtements, accessoires et souvenirs uniques de Sainte-Maxime. Édition limitée été 2026. Livraison offerte dès 60€.",
};

export default async function HomePage() {
  const [categories, products] = await Promise.all([getCategories(), getAllProducts()]);
  const featuredProducts = products.slice(0, 4);

  return (
    <div>
      <Hero />

      {/* Categories */}
      <section className="bg-sm-cream py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-sm-deep mb-12">
            Nos Collections
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <CategoryCard key={cat.name} {...cat} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-sm-deep mb-4">
            🔥 Tendances Été 2026
          </h2>
          <p className="text-center text-sm-gray mb-12 max-w-xl mx-auto">
            Nos produits phares, sélectionnés pour toi. Édition limitée, disponible uniquement cet été.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="text-center mt-10">
            <a
              href="/boutique/"
              className="inline-flex items-center gap-2 bg-sm-cyan text-white font-semibold px-8 py-4 rounded-full hover:bg-sm-deep transition-colors"
            >
              Voir toute la boutique
            </a>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="bg-sm-cream py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center p-6">
              <div className="w-14 h-14 bg-sm-cyan/10 rounded-full flex items-center justify-center mb-4">
                <Truck className="w-6 h-6 text-sm-cyan" />
              </div>
              <h3 className="font-bold text-sm-dark mb-2">Livraison Offerte</h3>
              <p className="text-sm-gray text-sm">Dès 60€ d'achat dans toute la France</p>
            </div>
            <div className="flex flex-col items-center text-center p-6">
              <div className="w-14 h-14 bg-sm-coral/10 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-sm-coral" />
              </div>
              <h3 className="font-bold text-sm-dark mb-2">Paiement Sécurisé</h3>
              <p className="text-sm-gray text-sm">Stripe & PayPal 100% sécurisés</p>
            </div>
            <div className="flex flex-col items-center text-center p-6">
              <div className="w-14 h-14 bg-sm-cyan/10 rounded-full flex items-center justify-center mb-4">
                <RefreshCw className="w-6 h-6 text-sm-cyan" />
              </div>
              <h3 className="font-bold text-sm-dark mb-2">Retours 30 Jours</h3>
              <p className="text-sm-gray text-sm">Satisfait ou remboursé</p>
            </div>
            <div className="flex flex-col items-center text-center p-6">
              <div className="w-14 h-14 bg-sm-coral/10 rounded-full flex items-center justify-center mb-4">
                <Star className="w-6 h-6 text-sm-coral" />
              </div>
              <h3 className="font-bold text-sm-dark mb-2">Qualité Premium</h3>
              <p className="text-sm-gray text-sm">Impression DTG haute définition</p>
            </div>
          </div>
        </div>
      </section>

      {/* UGC / Viral Section */}
      <UGCChallenge />

      {/* Gamification Banner */}
      <section className="bg-sm-cyan py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            🎰 ROUE DE LA FORTUNE
          </h2>
          <p className="text-white/90 mb-6">
            Tourne la roue et gagne jusqu'à -20% ou une livraison offerte !
          </p>
          <p className="text-white/70 text-sm">
            La roue apparaîtra automatiquement dans quelques secondes...
          </p>
        </div>
      </section>

      {/* About snippet */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-sm-deep mb-6">
            La Marque #SAINTEMAXIME
          </h2>
          <p className="text-sm-dark leading-relaxed mb-4">
            La Marque <strong>#SAINTEMAXIME</strong> est déposée depuis 2019. Le Site Officiel de la Marque a été créé dans le but de rassembler et vous proposer des Produits Uniques estampillés de la Marque, représentants la ville de Sainte Maxime.
          </p>
          <p className="text-sm-dark leading-relaxed mb-4">
            Vous y trouverez de nombreux produits Souvenirs <strong>#saintemaxime</strong> : Vêtements Homme & Femmes, Accessoires, produits de plage, et du quotidien.
          </p>
          <p className="text-sm-dark leading-relaxed mb-6">
            Serviettes de plage à vos couleurs préférées, Coques de Téléphones, Coussins, Vêtements Hommes et Femmes, Bracelets en Silicone. Nous avons des souvenirs de Sainte Maxime que vous ne trouverez nulle part ailleurs.
          </p>
          <p className="text-sm-coral font-semibold">
            Nous acceptons les Partenariats et Revendeurs. Contactez-nous pour plus de détails.
          </p>
        </div>
      </section>

      <Newsletter />

      <SpinWheel />
    </div>
  );
}

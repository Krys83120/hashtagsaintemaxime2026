import { Metadata } from "next";
import ProductCard from "@/components/ProductCard";
import { getAllProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Boutique #SAINTEMAXIME® | Tous les Produits | Souvenirs & Lifestyle 2026",
  description:
    "Tous les produits officiels #SAINTEMAXIME : vêtements, accessoires, souvenirs de Sainte-Maxime. Marque déposée. Livraison offerte dès 60€.",
};

export default async function BoutiquePage() {
  const products = await getAllProducts();
  return (
    <div className="min-h-screen bg-sm-cream">
      <div className="bg-gradient-to-b from-sm-cyan to-sm-deep py-16 px-4 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">
          Boutique #SAINTEMAXIME
        </h1>
        <p className="text-white/80 max-w-xl mx-auto">
          Tous nos produits officiels, estampillés de la marque. Livraison offerte dès 60€.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}

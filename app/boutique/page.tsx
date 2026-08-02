import { Metadata } from "next";
import ProductCard from "@/components/ProductCard";
import { getAllProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Boutique #SAINTEMAXIME® | Tous les Produits | Souvenirs & Lifestyle 2026",
  description:
    "Tous les produits officiels #SAINTEMAXIME : vêtements, accessoires, souvenirs de Sainte-Maxime. Marque déposée. Livraison offerte dès 60€.",
};

interface Props {
  searchParams: { search?: string };
}

export default async function BoutiquePage({ searchParams }: Props) {
  const allProducts = await getAllProducts();
  const searchTerm = searchParams.search?.trim().toLowerCase();
  const products = searchTerm
    ? allProducts.filter((p) => p.name.toLowerCase().includes(searchTerm))
    : allProducts;

  return (
    <div className="min-h-screen bg-sm-cream">
      <div className="bg-gradient-to-b from-sm-cyan to-sm-deep py-16 px-4 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">
          Boutique #SAINTEMAXIME
        </h1>
        <p className="text-white/80 max-w-xl mx-auto">
          {searchTerm
            ? `Résultats pour "${searchParams.search}" (${products.length})`
            : "Tous nos produits officiels, estampillés de la marque. Livraison offerte dès 60€."}
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {products.length === 0 ? (
          <p className="text-center text-sm-gray py-12">Aucun produit ne correspond à ta recherche.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

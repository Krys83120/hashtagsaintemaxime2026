"use client";

import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/products";

interface InfiniteProductCarouselProps {
  products: Product[];
}

export default function InfiniteProductCarousel({ products }: InfiniteProductCarouselProps) {
  if (products.length === 0) return null;

  // Durée proportionnelle au nombre de produits pour garder une vitesse de défilement constante
  const duration = Math.max(20, products.length * 4);

  return (
    <div className="relative overflow-hidden">
      {/* Dégradés sur les bords pour un effet de fondu propre */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-24 bg-gradient-to-r from-white to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-24 bg-gradient-to-l from-white to-transparent z-10" />

      <div
        className="flex gap-6 w-max"
        style={{
          animation: `sm-carousel-scroll ${duration}s linear infinite`,
        }}
      >
        {/* La liste est dupliquée pour créer une boucle visuellement continue et sans coupure */}
        {[...products, ...products].map((product, i) => (
          <div key={`${product.id}-${i}`} className="w-64 sm:w-72 flex-shrink-0">
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      <style>{`
        @keyframes sm-carousel-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

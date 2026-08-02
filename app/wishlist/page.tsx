"use client";

import Link from "next/link";
import { Heart, ShoppingCart, X } from "lucide-react";
import { useWishlistStore } from "@/lib/store/wishlist";
import { useCartStore } from "@/lib/store/cart";
import { formatPrice } from "@/lib/utils";

export default function WishlistPage() {
  const { items, removeItem } = useWishlistStore();
  const addToCart = useCartStore((state) => state.addItem);

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <Heart className="w-14 h-14 text-sm-gray mx-auto mb-4 opacity-30" />
        <h1 className="text-2xl font-bold text-sm-dark mb-2">Ta liste de souhaits est vide</h1>
        <p className="text-sm-gray mb-6">Clique sur le ♡ d'un produit pour l'ajouter ici.</p>
        <Link href="/boutique/" className="inline-block bg-sm-cyan text-white font-semibold px-6 py-3 rounded-full hover:bg-sm-deep transition-colors">
          Découvrir la boutique
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 sm:py-16">
      <h1 className="text-3xl font-bold text-sm-dark mb-8 flex items-center gap-2">
        <Heart className="w-7 h-7 text-sm-coral fill-sm-coral" /> Ma liste de souhaits
      </h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((item) => (
          <div key={item.productId} className="bg-white rounded-2xl border border-sm-lightgray overflow-hidden relative group">
            <button
              onClick={() => removeItem(item.productId)}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-red-50 flex items-center justify-center shadow-sm text-sm-gray hover:text-red-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <Link href={`/produit/${item.slug}/`} className="block aspect-square bg-sm-cream">
              {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-contain p-4" />}
            </Link>
            <div className="p-4">
              <Link href={`/produit/${item.slug}/`} className="font-medium text-sm-dark hover:text-sm-cyan transition-colors block mb-1">
                {item.name}
              </Link>
              <p className="text-sm-cyan font-bold mb-3">{formatPrice(item.price)}</p>
              <button
                onClick={() => addToCart({ productId: item.productId, slug: item.slug, name: item.name, price: item.price, image: item.image })}
                className="w-full flex items-center justify-center gap-2 bg-sm-cyan text-white font-medium py-2.5 rounded-xl hover:bg-sm-deep transition-colors text-sm"
              >
                <ShoppingCart className="w-4 h-4" /> Ajouter au panier
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

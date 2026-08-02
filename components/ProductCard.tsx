"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingCart, Check, Heart } from "lucide-react";
import { useState } from "react";
import { Product } from "@/lib/products";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/lib/store/cart";
import { useWishlistStore } from "@/lib/store/wishlist";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const toggleWishlist = useWishlistStore((state) => state.toggleItem);
  const isWishlisted = useWishlistStore((state) => state.isInWishlist(product.id));

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleWishlist({ productId: product.id, slug: product.slug, name: product.name, price: product.price, image: product.image });
  };

  const badgeColors: Record<string, string> = {
    BESTSELLER: "bg-sm-coral",
    "ÉDITION LIMITÉE": "bg-yellow-400 text-sm-dark",
    NOUVEAU: "bg-sm-cyan",
    TENDANCE: "bg-sm-cyan",
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.image,
      color: product.colors[0]?.name,
      size: product.sizes[0],
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group bg-sm-cream rounded-2xl border border-sm-lightgray overflow-hidden hover:shadow-lg hover:shadow-sm-cyan/10 transition-all"
    >
      <Link href={`/produit/${product.slug}/`} className="block">
        <div className="relative aspect-square bg-gradient-to-br from-sm-cyan/10 to-sm-coral/10 p-4">
          {product.badge && (
            <span className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-md text-white ${badgeColors[product.badge] || "bg-sm-cyan"}`}>
              {product.badge}
            </span>
          )}
          <button
            onClick={handleWishlistToggle}
            className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-sm transition-colors"
            aria-label={isWishlisted ? "Retirer de la liste de souhaits" : "Ajouter à la liste de souhaits"}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? "fill-sm-coral text-sm-coral" : "text-sm-dark"}`} />
          </button>
          <div className="w-full h-full flex items-center justify-center">
  {product.image ? (
    <img
      src={product.image}
      alt={product.name}
      className="w-full h-full object-contain"
    />
  ) : (
    <div className="w-32 h-32 rounded-full bg-sm-cyan/20 flex items-center justify-center text-sm-cyan text-4xl font-bold">
      #
    </div>
  )}
</div>
          {/* Quick hover overlay */}
          <div className="absolute inset-0 bg-sm-cyan/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="bg-white text-sm-cyan font-semibold px-4 py-2 rounded-full text-sm shadow-sm">
              Voir le produit
            </span>
          </div>
        </div>
        <div className="p-4 text-center">
          <h3 className="font-semibold text-sm-dark mb-1 group-hover:text-sm-cyan transition-colors text-sm">
            {product.name}
          </h3>
          <p className="text-lg font-bold text-sm-cyan">{formatPrice(product.price)}</p>
        </div>
      </Link>
      <div className="px-4 pb-4">
        <button
          onClick={handleQuickAdd}
          disabled={!product.inStock}
          className="w-full flex items-center justify-center gap-2 bg-sm-cyan text-white font-medium py-2.5 rounded-xl hover:bg-sm-deep transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {added ? (
            <>
              <Check className="w-4 h-4" /> Ajouté !
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" />
              {product.inStock ? "Ajouter au panier" : "Rupture de stock"}
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}

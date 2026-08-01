"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import type { Product } from "@/lib/products";

interface AddToCartProps {
  product: Product;
}

export default function AddToCart({ product }: AddToCartProps) {
  const [color, setColor] = useState(product.colors[0]?.name || "");
  const [size, setSize] = useState(product.sizes[0] || "");
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const handleAdd = () => {
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.image,
      color: color || undefined,
      size: size || undefined,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <>
      {product.colors.length > 0 && (
        <div>
          <p className="font-semibold text-sm-dark mb-2">
            Couleur{color && <span className="text-sm-gray font-normal"> — {color}</span>}
          </p>
          <div className="flex gap-2">
            {product.colors.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => setColor(c.name)}
                className={`w-10 h-10 rounded-full border-2 transition-colors shadow-sm ${
                  color === c.name ? "border-sm-cyan ring-2 ring-sm-cyan/30" : "border-sm-lightgray hover:border-sm-cyan"
                }`}
                style={{ backgroundColor: c.hex }}
                title={c.name}
                aria-label={`Couleur ${c.name}`}
              />
            ))}
          </div>
        </div>
      )}

      {product.sizes.length > 0 && (
        <div>
          <p className="font-semibold text-sm-dark mb-2">Taille</p>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  size === s
                    ? "border-sm-cyan bg-sm-cyan/10 text-sm-cyan"
                    : "border-sm-lightgray hover:border-sm-cyan hover:bg-sm-cyan/5"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          type="button"
          onClick={handleAdd}
          disabled={!product.inStock}
          className="flex-1 bg-sm-cyan text-white font-bold py-4 rounded-xl hover:bg-sm-deep transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {added ? (
            <>
              <Check className="w-5 h-5" /> Ajouté !
            </>
          ) : product.inStock ? (
            "Ajouter au panier"
          ) : (
            "Rupture de stock"
          )}
        </button>

        <button
          type="button"
          className="flex-1 border-2 border-sm-cyan text-sm-cyan font-bold py-4 rounded-xl hover:bg-sm-cyan/5 transition-colors"
        >
          Ajouter à la Wishlist
        </button>
      </div>
    </>
  );
}

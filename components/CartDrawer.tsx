"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useCartStore } from "@/lib/store/cart";
import { formatPrice } from "@/lib/utils";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, updateQuantity, removeItem, totalPrice } = useCartStore();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-[60]"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white z-[70] shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-sm-lightgray">
              <h2 className="text-lg font-bold text-sm-dark flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-sm-cyan" />
                Mon panier ({items.reduce((s, i) => s + i.quantity, 0)})
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-sm-cream rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-sm-gray gap-3">
                  <ShoppingBag className="w-12 h-12 opacity-30" />
                  <p>Ton panier est vide pour l'instant.</p>
                  <Link
                    href="/boutique/"
                    onClick={onClose}
                    className="text-sm-cyan font-semibold hover:underline"
                  >
                    Découvrir la boutique →
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={`${item.productId}-${item.color}-${item.size}`} className="flex gap-3 pb-4 border-b border-sm-lightgray/50">
                      <div className="w-20 h-20 rounded-xl bg-sm-cream overflow-hidden flex-shrink-0">
                        {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm-dark text-sm truncate">{item.name}</p>
                        <p className="text-xs text-sm-gray">
                          {[item.color, item.size].filter(Boolean).join(" · ")}
                        </p>
                        <p className="text-sm-cyan font-bold text-sm mt-1">{formatPrice(item.price)}</p>

                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1, item.color, item.size)}
                            className="w-6 h-6 rounded-full border border-sm-lightgray flex items-center justify-center hover:border-sm-cyan transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1, item.color, item.size)}
                            className="w-6 h-6 rounded-full border border-sm-lightgray flex items-center justify-center hover:border-sm-cyan transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => removeItem(item.productId, item.color, item.size)}
                            className="ml-auto p-1 text-red-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="px-6 py-5 border-t border-sm-lightgray space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm-dark">Total</span>
                  <span className="text-xl font-bold text-sm-cyan">{formatPrice(totalPrice())}</span>
                </div>
                <Link
                  href="/checkout/"
                  onClick={onClose}
                  className="block w-full text-center bg-sm-coral text-white font-bold py-3.5 rounded-full hover:bg-sm-coral/90 transition-colors"
                >
                  Passer commande
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

"use client";

import { useEffect } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";

export default function OrderConfirmedPage() {
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-6" />
      <h1 className="text-3xl font-bold text-sm-dark mb-3">Merci pour ta commande !</h1>
      <p className="text-sm-gray mb-8">
        Ton paiement a bien été reçu. Tu vas recevoir un email de confirmation avec le détail de ta commande.
      </p>
      <Link
        href="/boutique/"
        className="inline-block bg-sm-cyan text-white font-semibold px-8 py-3 rounded-full hover:bg-sm-deep transition-colors"
      >
        Continuer mes achats
      </Link>
    </div>
  );
}

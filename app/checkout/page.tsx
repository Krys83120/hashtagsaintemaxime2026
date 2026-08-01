"use client";

import { useState } from "react";
import Link from "next/link";
import { useCartStore } from "@/lib/store/cart";
import { formatPrice } from "@/lib/utils";
import { ShoppingBag, Loader2 } from "lucide-react";

export default function CheckoutPage() {
  const { items, totalPrice } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    line1: "",
    postalCode: "",
    city: "",
    phone: "",
  });

  const subtotal = totalPrice();
  const shipping = subtotal >= 60 || subtotal === 0 ? 0 : 4.9;
  const total = subtotal + shipping;

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.email || !form.line1 || !form.postalCode || !form.city) {
      setError("Merci de remplir tous les champs obligatoires.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          customer: {
            name: form.name,
            email: form.email,
            address: { line1: form.line1, postalCode: form.postalCode, city: form.city, phone: form.phone },
          },
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur lors de la création du paiement.");
        setLoading(false);
        return;
      }

      window.location.href = data.url;
    } catch {
      setError("Erreur réseau, réessaie.");
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <ShoppingBag className="w-14 h-14 text-sm-gray mx-auto mb-4 opacity-40" />
        <h1 className="text-2xl font-bold text-sm-dark mb-2">Ton panier est vide</h1>
        <p className="text-sm-gray mb-6">Ajoute des produits avant de passer commande.</p>
        <Link href="/boutique/" className="inline-block bg-sm-cyan text-white font-semibold px-6 py-3 rounded-full hover:bg-sm-deep transition-colors">
          Découvrir la boutique
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 sm:py-16">
      <h1 className="text-3xl font-bold text-sm-dark mb-8">Finaliser ma commande</h1>

      <div className="grid lg:grid-cols-5 gap-10">
        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-5">
          <div>
            <label className="block text-sm font-medium text-sm-dark mb-1">Nom complet *</label>
            <input
              type="text" required value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-sm-lightgray focus:border-sm-cyan focus:ring-2 focus:ring-sm-cyan/20 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-sm-dark mb-1">Email *</label>
            <input
              type="email" required value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-sm-lightgray focus:border-sm-cyan focus:ring-2 focus:ring-sm-cyan/20 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-sm-dark mb-1">Téléphone</label>
            <input
              type="tel" value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-sm-lightgray focus:border-sm-cyan focus:ring-2 focus:ring-sm-cyan/20 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-sm-dark mb-1">Adresse *</label>
            <input
              type="text" required value={form.line1}
              onChange={(e) => updateField("line1", e.target.value)}
              placeholder="N° et nom de rue"
              className="w-full px-4 py-3 rounded-xl border border-sm-lightgray focus:border-sm-cyan focus:ring-2 focus:ring-sm-cyan/20 outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-sm-dark mb-1">Code postal *</label>
              <input
                type="text" required value={form.postalCode}
                onChange={(e) => updateField("postalCode", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-sm-lightgray focus:border-sm-cyan focus:ring-2 focus:ring-sm-cyan/20 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-sm-dark mb-1">Ville *</label>
              <input
                type="text" required value={form.city}
                onChange={(e) => updateField("city", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-sm-lightgray focus:border-sm-cyan focus:ring-2 focus:ring-sm-cyan/20 outline-none"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-xl p-3">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sm-coral text-white font-bold py-4 rounded-full hover:bg-sm-coral/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Redirection vers le paiement...
              </>
            ) : (
              `Payer ${formatPrice(total)}`
            )}
          </button>
          <p className="text-xs text-sm-gray text-center">Paiement sécurisé par Stripe. Tes données de carte ne transitent jamais par notre site.</p>
        </form>

        {/* Récap panier */}
        <div className="lg:col-span-2">
          <div className="bg-sm-cream rounded-2xl p-6 space-y-4 sticky top-24">
            <h2 className="font-bold text-sm-dark">Récapitulatif</h2>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={`${item.productId}-${item.color}-${item.size}`} className="flex justify-between text-sm">
                  <span className="text-sm-dark">
                    {item.name} × {item.quantity}
                    {(item.color || item.size) && (
                      <span className="text-sm-gray"> ({[item.color, item.size].filter(Boolean).join(", ")})</span>
                    )}
                  </span>
                  <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-sm-lightgray/70 pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-sm-gray">
                <span>Sous-total</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm-gray">
                <span>Livraison</span>
                <span>{shipping === 0 ? "Offerte" : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm-dark text-base pt-2 border-t border-sm-lightgray/70">
                <span>Total</span>
                <span className="text-sm-cyan">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

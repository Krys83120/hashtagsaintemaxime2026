"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface ReviewFormProps {
  productId: string;
  onSubmitted?: () => void;
}

export default function ReviewForm({ productId, onSubmitted }: ReviewFormProps) {
  const [user, setUser] = useState<{ id: string; name: string } | null>(null);
  const [checking, setChecking] = useState(true);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  useEffect(() => {
    const check = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        setUser({ id: authUser.id, name: (authUser.user_metadata as any)?.full_name || authUser.email || "Client" });
      }
      setChecking(false);
    };
    check();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Choisis une note avant d'envoyer ton avis.");
      return;
    }
    setSubmitting(true);
    setError("");

    const { error: insertError } = await supabase.from("reviews").insert({
      product_id: productId,
      author: user!.name,
      user_id: user!.id,
      rating,
      text: text.trim(),
    });

    setSubmitting(false);

    if (insertError) {
      setError("Erreur : " + insertError.message);
      return;
    }

    setDone(true);
    onSubmitted?.();
  };

  if (checking) return null;

  if (done) {
    return (
      <div className="bg-green-50 text-green-700 rounded-2xl p-6 text-center">
        ✅ Merci pour ton avis, il apparaîtra en ligne sous peu !
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-sm-cream rounded-2xl p-6 text-center">
        <p className="text-sm-dark mb-3">Connecte-toi pour laisser un avis sur ce produit.</p>
        <Link href="/compte/connexion/" className="inline-block bg-sm-cyan text-white font-semibold px-6 py-2.5 rounded-full hover:bg-sm-deep transition-colors text-sm">
          Se connecter
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-sm-lightgray rounded-2xl p-6 space-y-4">
      <h3 className="font-bold text-sm-dark">Laisser un avis</h3>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            onMouseEnter={() => setHoverRating(i)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => setRating(i)}
          >
            <Star className={`w-7 h-7 transition-colors ${i <= (hoverRating || rating) ? "fill-yellow-400 text-yellow-400" : "text-sm-lightgray"}`} />
          </button>
        ))}
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Ton avis sur ce produit (facultatif)"
        rows={3}
        className="w-full px-4 py-3 rounded-xl border border-sm-lightgray focus:border-sm-cyan outline-none text-sm resize-none"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="bg-sm-cyan text-white font-semibold px-6 py-2.5 rounded-full hover:bg-sm-deep transition-colors text-sm disabled:opacity-60"
      >
        {submitting ? "Envoi..." : "Publier mon avis"}
      </button>
    </form>
  );
}

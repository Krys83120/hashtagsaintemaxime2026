"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Send } from "lucide-react";

interface NewsletterProps {
  title?: string;
  text?: string;
}

export default function Newsletter({ title, text }: NewsletterProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Une erreur est survenue, réessaie.");
        setLoading(false);
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Erreur réseau, réessaie.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-sm-dark py-20 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-sm-cyan mb-4">
            {title || "Rejoins la #SAINTEMAXIME Family"}
          </h2>
          <p className="text-white/80 mb-8 text-lg">
            {text || "10% de bienvenue + accès aux ventes privées et aux nouveautés avant tout le monde"}
          </p>

          {!submitted ? (
            <>
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
                <div className="relative flex-1">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sm-gray" />
                  <input
                    type="email"
                    required
                    placeholder="Ton email..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border-0 outline-none focus:ring-2 focus:ring-sm-cyan text-sm-dark"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center gap-2 bg-sm-coral text-white font-bold px-8 py-4 rounded-2xl hover:bg-sm-coral/90 transition-colors disabled:opacity-60"
                >
                  {loading ? "Inscription..." : "Je m'inscris"}
                  <Send className="w-4 h-4" />
                </button>
              </form>
              {error && <p className="text-sm-coral text-sm mt-3">{error}</p>}
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 inline-block"
            >
              <p className="text-white font-semibold text-lg mb-2">🎉 Bienvenue dans la Family !</p>
              <div className="bg-white/20 rounded-xl px-6 py-3 inline-block mb-2">
                <p className="text-white/70 text-xs uppercase tracking-wider">Ton code</p>
                <p className="text-sm-cyan font-black text-2xl tracking-wide">NEWSLETTER10</p>
              </div>
              <p className="text-white/70 text-sm">-10% sur ta prochaine commande — aussi envoyé par email.</p>
            </motion.div>
          )}

          <p className="text-white/40 text-xs mt-4">
            Pas de spam. Tu peux te désinscrire à tout moment.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Send } from "lucide-react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
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
            Rejoins la #SAINTEMAXIME Family
          </h2>
          <p className="text-white/80 mb-8 text-lg">
            10% de bienvenue + accès aux ventes privées et aux nouveautés avant tout le monde
          </p>

          {!submitted ? (
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
                className="flex items-center justify-center gap-2 bg-sm-coral text-white font-bold px-8 py-4 rounded-2xl hover:bg-sm-coral/90 transition-colors"
              >
                Je m'inscris
                <Send className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 inline-block"
            >
              <p className="text-white font-semibold text-lg">🎉 Bienvenue dans la Family !</p>
              <p className="text-white/70 text-sm mt-1">Vérifie tes emails pour ton code de -10%</p>
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

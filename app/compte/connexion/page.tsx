"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { LogIn, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ConnexionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justSignedUp = searchParams.get("inscription") === "confirme";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (authError) {
      setError("Email ou mot de passe incorrect.");
      return;
    }

    router.push("/compte/");
    router.refresh();
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-lg p-8 w-full max-w-md border border-sm-lightgray"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-sm-cyan/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-7 h-7 text-sm-cyan" />
          </div>
          <h1 className="text-2xl font-bold text-sm-dark">Se connecter</h1>
          <p className="text-sm-gray text-sm mt-1">Accède à ton compte #SAINTEMAXIME</p>
        </div>

        {justSignedUp && (
          <p className="text-sm text-green-700 bg-green-50 rounded-xl p-3 mb-4">
            Compte créé ! Vérifie tes emails pour confirmer ton adresse avant de te connecter.
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-sm-dark mb-1">Email</label>
            <input
              type="email" required value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-sm-lightgray focus:border-sm-cyan focus:ring-2 focus:ring-sm-cyan/20 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-sm-dark mb-1">Mot de passe</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"} required value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-sm-lightgray focus:border-sm-cyan focus:ring-2 focus:ring-sm-cyan/20 outline-none pr-12"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm-gray hover:text-sm-cyan transition-colors">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl p-3">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full bg-sm-cyan text-white font-bold py-3.5 rounded-xl hover:bg-sm-deep transition-colors disabled:opacity-60">
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <p className="text-center text-sm text-sm-gray mt-6">
          Pas encore de compte ?{" "}
          <Link href="/compte/inscription/" className="text-sm-cyan font-semibold hover:underline">
            S'inscrire
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

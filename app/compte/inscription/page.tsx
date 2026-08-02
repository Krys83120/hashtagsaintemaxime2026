"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { UserPlus, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function InscriptionPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password.length < 8) {
      setError("Le mot de passe doit faire au moins 8 caractères.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.name } },
    });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message === "User already registered"
        ? "Un compte existe déjà avec cet email."
        : signUpError.message);
      return;
    }

    if (data.session) {
      router.push("/compte/");
      router.refresh();
    } else {
      // Confirmation email requise avant de pouvoir se connecter
      router.push("/compte/connexion/?inscription=confirme");
    }
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
            <UserPlus className="w-7 h-7 text-sm-cyan" />
          </div>
          <h1 className="text-2xl font-bold text-sm-dark">Créer mon compte</h1>
          <p className="text-sm-gray text-sm mt-1">Suis tes commandes et gère tes infos facilement</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-sm-dark mb-1">Nom complet</label>
            <input
              type="text" required value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-sm-lightgray focus:border-sm-cyan focus:ring-2 focus:ring-sm-cyan/20 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-sm-dark mb-1">Email</label>
            <input
              type="email" required value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-sm-lightgray focus:border-sm-cyan focus:ring-2 focus:ring-sm-cyan/20 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-sm-dark mb-1">Mot de passe</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"} required value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-sm-lightgray focus:border-sm-cyan focus:ring-2 focus:ring-sm-cyan/20 outline-none pr-12"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm-gray hover:text-sm-cyan transition-colors">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-sm-gray mt-1">8 caractères minimum</p>
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl p-3">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full bg-sm-cyan text-white font-bold py-3.5 rounded-xl hover:bg-sm-deep transition-colors disabled:opacity-60">
            {loading ? "Création..." : "Créer mon compte"}
          </button>
        </form>

        <p className="text-center text-sm text-sm-gray mt-6">
          Déjà un compte ?{" "}
          <Link href="/compte/connexion/" className="text-sm-cyan font-semibold hover:underline">
            Se connecter
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

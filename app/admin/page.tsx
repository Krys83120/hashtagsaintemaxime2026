"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
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
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !data.user) {
      setError("Identifiants incorrects.");
      setLoading(false);
      return;
    }

    // Vérifie que ce compte est bien un admin actif (table admin_users)
    const { data: adminProfile } = await supabase
      .from("admin_users")
      .select("active")
      .eq("id", data.user.id)
      .single();

    if (!adminProfile || !adminProfile.active) {
      setError("Ce compte n'a pas accès à l'administration.");
      await supabase.auth.signOut();
      setLoading(false);
      return;
    }

    router.push("/admin/dashboard/");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sm-cyan/10 to-sm-coral/10 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-sm-cyan/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-sm-cyan" />
          </div>
          <h1 className="text-2xl font-bold text-sm-dark">Admin #SAINTEMAXIME</h1>
          <p className="text-sm-gray text-sm mt-1">Espace réservé aux administrateurs</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-sm-dark mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-sm-lightgray focus:border-sm-cyan focus:ring-2 focus:ring-sm-cyan/20 outline-none"
              placeholder="toi@exemple.fr"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-sm-dark mb-1">Mot de passe</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-sm-lightgray focus:border-sm-cyan focus:ring-2 focus:ring-sm-cyan/20 outline-none pr-12"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm-gray hover:text-sm-cyan transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm-coral text-sm text-center"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sm-cyan text-white font-bold py-3 rounded-xl hover:bg-sm-deep transition-colors disabled:opacity-60"
          >
            {loading ? "Vérification..." : "Se connecter"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

"use client";

import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { motion } from "framer-motion";
import { RefreshCw, Check, AlertTriangle, Info } from "lucide-react";

interface SyncResult {
  total: number;
  synced: number;
  results: { name: string; status: "ok" | "error"; message?: string }[];
}

export default function AdminPrintfulPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<SyncResult | null>(null);

  const syncProducts = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/admin/sync-printful", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur de synchronisation.");
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-sm-dark">🖨️ Printful</h1>
          <p className="text-sm-gray">Synchronise ta boutique Printful directement avec Supabase</p>
        </div>

        <div className="p-4 bg-blue-50 text-blue-800 rounded-xl text-sm flex items-start gap-2">
          <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            La clé API Printful est configurée côté serveur (variable d'environnement <code className="bg-white px-1 rounded">PRINTFUL_API_KEY</code> sur Vercel), pas ici — pour des raisons de sécurité, elle ne transite jamais par le navigateur.
            Un clic sur "Synchroniser" va chercher tous tes produits Printful (avec toutes leurs images et variantes) et les met à jour directement dans Supabase.
          </div>
        </div>

        <div className="p-4 bg-yellow-50 text-yellow-800 rounded-xl text-sm flex items-start gap-2">
          <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <strong>Prix :</strong> calculé une seule fois, au tout premier import — les synchros suivantes ne le touchent plus, pour respecter tes ajustements manuels dans Produits. S'il y a plusieurs prix selon la taille/couleur, le prix le plus bas est utilisé.<br />
            <strong>Images :</strong> les doublons (même photo en version nette et en miniature floue) sont automatiquement détectés et filtrés — seule la version la plus nette est gardée.
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-sm-lightgray">
          <h2 className="text-lg font-bold text-sm-dark mb-4 flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-sm-cyan" />
            Synchronisation
          </h2>
          <button
            onClick={syncProducts}
            disabled={loading}
            className="flex items-center gap-2 bg-sm-cyan text-white font-semibold px-6 py-3 rounded-xl hover:bg-sm-deep transition-colors disabled:opacity-60"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Synchronisation en cours (peut prendre 1-2 min)..." : "Synchroniser les produits"}
          </button>

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl text-sm flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> {error}
            </motion.div>
          )}

          {result && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="mt-4 p-4 bg-green-50 text-green-700 rounded-xl text-sm flex items-center gap-2">
              <Check className="w-5 h-5" /> {result.synced} / {result.total} produits synchronisés vers Supabase.
            </motion.div>
          )}
        </div>

        {result && result.results.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-sm-lightgray">
            <h2 className="text-lg font-bold text-sm-dark mb-4">Détail ({result.results.length})</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-sm-lightgray text-sm-gray">
                    <th className="text-left py-3 px-4">Nom</th>
                    <th className="text-left py-3 px-4">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {result.results.map((r, i) => (
                    <tr key={i} className="border-b border-sm-lightgray/50 hover:bg-sm-cream transition-colors">
                      <td className="py-3 px-4 font-medium">{r.name}</td>
                      <td className="py-3 px-4">
                        {r.status === "ok" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-medium">
                            <Check className="w-3 h-3" /> Sync
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs font-medium" title={r.message}>
                            <AlertTriangle className="w-3 h-3" /> Erreur
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

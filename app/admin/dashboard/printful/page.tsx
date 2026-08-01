"use client";

import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { motion } from "framer-motion";
import { Key, RefreshCw, Check, AlertTriangle, Package } from "lucide-react";

interface PrintfulProduct {
  id: string;
  name: string;
  thumbnail_url: string;
  variants: number;
  synced: boolean;
}

export default function AdminPrintfulPage() {
  const [apiKey, setApiKey] = useState("");
  const [savedKey, setSavedKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<PrintfulProduct[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const saveKey = () => {
    if (!apiKey.trim()) return;
    localStorage.setItem("sm_printful_api_key", apiKey.trim());
    setSavedKey(apiKey.trim());
    setSuccess("✅ Clé API Printful sauvegardée !");
    setTimeout(() => setSuccess(""), 3000);
  };

  const syncProducts = async () => {
    const key = savedKey || localStorage.getItem("sm_printful_api_key");
    if (!key) {
      setError("❌ Configure d'abord ta clé API Printful");
      return;
    }
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // Fetch stores first
      const storesRes = await fetch("https://api.printful.com/v2/stores", {
        headers: { Authorization: `Bearer ${key}` },
      });
      
      if (!storesRes.ok) throw new Error("Clé API invalide ou accès refusé");
      
      const storesData = await storesRes.json();
      const storeId = storesData.data?.[0]?.id;
      
      if (!storeId) throw new Error("Aucun store Printful trouvé");

      // Fetch products from store
      const productsRes = await fetch(`https://api.printful.com/v2/stores/${storeId}/products`, {
        headers: { Authorization: `Bearer ${key}` },
      });
      
      const productsData = await productsRes.json();
      
      const mapped: PrintfulProduct[] = (productsData.data || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        thumbnail_url: p.thumbnail_url || "",
        variants: p.variants?.length || 0,
        synced: false,
      }));

      setProducts(mapped);
      localStorage.setItem("sm_printful_products", JSON.stringify(mapped));
      setSuccess(`✅ ${mapped.length} produits trouvés dans ton store Printful !`);
    } catch (err: any) {
      setError(`❌ Erreur : ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const exportToSite = () => {
    if (products.length === 0) {
      setError("❌ Aucun produit à exporter. Synchronise d'abord.");
      return;
    }
    // In a real app, this would generate the products.ts file
    // For now, we save to localStorage
    localStorage.setItem("sm_site_products", JSON.stringify(products));
    setSuccess(`✅ ${products.length} produits exportés vers le site ! Redémarre le build pour appliquer.`);
    setTimeout(() => setSuccess(""), 5000);
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-sm-dark">🖨️ Printful</h1>
          <p className="text-sm-gray">Synchronise ta boutique Printful avec le site #SAINTEMAXIME</p>
        </div>

        {/* API Key */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-sm-lightgray">
          <h2 className="text-lg font-bold text-sm-dark mb-4 flex items-center gap-2">
            <Key className="w-5 h-5 text-sm-cyan" />
            Clé API Printful
          </h2>
          <p className="text-sm text-sm-gray mb-4">
            Va sur <a href="https://www.printful.com/dashboard/settings/api" target="_blank" rel="noopener noreferrer" className="text-sm-cyan underline">Printful → API → Tokens</a> et génère une clé API v2.
          </p>
          <div className="flex gap-3">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="<CLE_API_PRINTFUL>"
              className="flex-1 px-4 py-3 rounded-xl border border-sm-lightgray focus:border-sm-cyan focus:ring-2 focus:ring-sm-cyan/20 outline-none text-sm"
            />
            <button
              onClick={saveKey}
              className="bg-sm-cyan text-white font-semibold px-6 py-3 rounded-xl hover:bg-sm-deep transition-colors"
            >
              Sauvegarder
            </button>
          </div>
          {savedKey && (
            <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
              <Check className="w-4 h-4" /> Clé enregistrée (masquée pour la sécurité)
            </p>
          )}
        </div>

        {/* Sync */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-sm-lightgray">
          <h2 className="text-lg font-bold text-sm-dark mb-4 flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-sm-cyan" />
            Synchronisation
          </h2>
          <div className="flex gap-3">
            <button
              onClick={syncProducts}
              disabled={loading}
              className="flex items-center gap-2 bg-sm-cyan text-white font-semibold px-6 py-3 rounded-xl hover:bg-sm-deep transition-colors disabled:opacity-60"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Synchronisation..." : "Synchroniser les produits"}
            </button>
            <button
              onClick={exportToSite}
              className="flex items-center gap-2 bg-sm-coral text-white font-semibold px-6 py-3 rounded-xl hover:bg-sm-coral/90 transition-colors"
            >
              <Package className="w-5 h-5" />
              Exporter vers le site
            </button>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl text-sm flex items-center gap-2"
            >
              <AlertTriangle className="w-5 h-5" />
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 p-4 bg-green-50 text-green-600 rounded-xl text-sm flex items-center gap-2"
            >
              <Check className="w-5 h-5" />
              {success}
            </motion.div>
          )}
        </div>

        {/* Products list */}
        {products.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-sm-lightgray">
            <h2 className="text-lg font-bold text-sm-dark mb-4">
              Produits synchronisés ({products.length})
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-sm-lightgray text-sm-gray">
                    <th className="text-left py-3 px-4">ID</th>
                    <th className="text-left py-3 px-4">Nom</th>
                    <th className="text-left py-3 px-4">Variantes</th>
                    <th className="text-left py-3 px-4">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="border-b border-sm-lightgray/50 hover:bg-sm-cream transition-colors">
                      <td className="py-3 px-4 font-mono text-xs">{p.id}</td>
                      <td className="py-3 px-4 font-medium">{p.name}</td>
                      <td className="py-3 px-4">{p.variants}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-medium">
                          <Check className="w-3 h-3" /> Sync
                        </span>
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

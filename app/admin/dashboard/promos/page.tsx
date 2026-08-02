"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { motion } from "framer-motion";
import { Save, Plus, Trash2, Tag } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface PromoCode {
  id?: string;
  code: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  active: boolean;
  minOrderAmount: number;
  usageLimit: number | null;
  usageCount: number;
  expiresAt: string | null;
}

function fromDbRow(row: any): PromoCode {
  return {
    id: row.id,
    code: row.code,
    discountType: row.discount_type,
    discountValue: Number(row.discount_value),
    active: row.active,
    minOrderAmount: Number(row.min_order_amount || 0),
    usageLimit: row.usage_limit,
    usageCount: row.usage_count || 0,
    expiresAt: row.expires_at,
  };
}

export default function AdminPromosPage() {
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newPromo, setNewPromo] = useState({ code: "", discountType: "percent" as "percent" | "fixed", discountValue: 10, minOrderAmount: 0 });
  const supabase = createClient();

  useEffect(() => {
    loadPromos();
  }, []);

  const loadPromos = async () => {
    setLoading(true);
    const { data, error: loadError } = await supabase.from("promo_codes").select("*").order("created_at", { ascending: false });
    if (loadError) {
      setError("Erreur de chargement : " + loadError.message);
    } else {
      setPromos((data || []).map(fromDbRow));
    }
    setLoading(false);
  };

  const addPromo = async () => {
    if (!newPromo.code.trim()) return;
    setSaving("new");
    setError("");

    const { error: insertError } = await supabase.from("promo_codes").insert({
      code: newPromo.code.trim().toUpperCase(),
      discount_type: newPromo.discountType,
      discount_value: newPromo.discountValue,
      min_order_amount: newPromo.minOrderAmount,
      active: true,
    });

    setSaving(null);
    if (insertError) {
      setError(insertError.message.includes("duplicate") ? "Ce code existe déjà." : insertError.message);
      return;
    }
    setNewPromo({ code: "", discountType: "percent", discountValue: 10, minOrderAmount: 0 });
    setShowAdd(false);
    loadPromos();
  };

  const toggleActive = async (promo: PromoCode) => {
    await supabase.from("promo_codes").update({ active: !promo.active }).eq("id", promo.id);
    loadPromos();
  };

  const deletePromo = async (promo: PromoCode) => {
    if (!confirm(`Supprimer le code ${promo.code} ?`)) return;
    await supabase.from("promo_codes").delete().eq("id", promo.id);
    loadPromos();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-sm-dark">🏷️ Codes promo</h1>
            <p className="text-sm-gray">{promos.length} codes créés</p>
          </div>
          <button onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-2 bg-sm-cyan text-white font-semibold px-4 py-2.5 rounded-xl hover:bg-sm-deep transition-colors">
            <Plus className="w-4 h-4" /> Nouveau code
          </button>
        </div>

        {error && <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm font-medium">⚠️ {error}</div>}

        {showAdd && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            className="bg-white rounded-2xl p-6 border border-sm-lightgray space-y-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <input type="text" placeholder="CODE (ex: ETE2026)" value={newPromo.code}
                onChange={(e) => setNewPromo((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                className="px-4 py-2.5 rounded-xl border border-sm-lightgray focus:border-sm-cyan outline-none text-sm font-mono" />
              <select value={newPromo.discountType}
                onChange={(e) => setNewPromo((p) => ({ ...p, discountType: e.target.value as "percent" | "fixed" }))}
                className="px-4 py-2.5 rounded-xl border border-sm-lightgray focus:border-sm-cyan outline-none text-sm bg-white">
                <option value="percent">Pourcentage (%)</option>
                <option value="fixed">Montant fixe (€)</option>
              </select>
              <input type="number" placeholder="Valeur" value={newPromo.discountValue}
                onChange={(e) => setNewPromo((p) => ({ ...p, discountValue: Number(e.target.value) }))}
                className="px-4 py-2.5 rounded-xl border border-sm-lightgray focus:border-sm-cyan outline-none text-sm" />
              <input type="number" placeholder="Achat minimum (€)" value={newPromo.minOrderAmount}
                onChange={(e) => setNewPromo((p) => ({ ...p, minOrderAmount: Number(e.target.value) }))}
                className="px-4 py-2.5 rounded-xl border border-sm-lightgray focus:border-sm-cyan outline-none text-sm" />
            </div>
            <div className="flex gap-3">
              <button onClick={addPromo} disabled={saving === "new"}
                className="bg-green-500 text-white font-semibold px-6 py-2 rounded-xl hover:bg-green-600 transition-colors disabled:opacity-60">
                {saving === "new" ? "Création..." : "Créer"}
              </button>
              <button onClick={() => setShowAdd(false)} className="bg-sm-lightgray text-sm-dark font-semibold px-6 py-2 rounded-xl">
                Annuler
              </button>
            </div>
          </motion.div>
        )}

        {loading && (
          <div className="bg-white rounded-2xl p-12 text-center border border-sm-lightgray text-sm-gray">Chargement...</div>
        )}

        <div className="bg-white rounded-2xl border border-sm-lightgray overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-sm-cream border-b border-sm-lightgray text-sm-gray text-xs uppercase tracking-wider">
                  <th className="text-left py-3 px-4">Code</th>
                  <th className="text-left py-3 px-4">Réduction</th>
                  <th className="text-left py-3 px-4">Minimum</th>
                  <th className="text-left py-3 px-4">Utilisé</th>
                  <th className="text-left py-3 px-4">Statut</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {promos.map((p) => (
                  <tr key={p.id} className="border-b border-sm-lightgray/50 hover:bg-sm-cream/50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-sm-dark flex items-center gap-1"><Tag className="w-3.5 h-3.5 text-sm-cyan" /> {p.code}</span>
                    </td>
                    <td className="py-3 px-4">{p.discountType === "percent" ? `${p.discountValue}%` : `${p.discountValue}€`}</td>
                    <td className="py-3 px-4 text-sm-gray">{p.minOrderAmount > 0 ? `${p.minOrderAmount}€` : "—"}</td>
                    <td className="py-3 px-4 text-sm-gray">{p.usageCount}{p.usageLimit ? ` / ${p.usageLimit}` : ""}</td>
                    <td className="py-3 px-4">
                      <button onClick={() => toggleActive(p)}
                        className={`px-2 py-1 rounded-lg text-xs font-bold ${p.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {p.active ? "Actif" : "Inactif"}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <button onClick={() => deletePromo(p)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!loading && promos.length === 0 && (
            <div className="p-12 text-center text-sm-gray">Aucun code promo pour l'instant.</div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

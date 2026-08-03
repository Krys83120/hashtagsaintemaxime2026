"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { motion } from "framer-motion";
import { Save, Plus, Trash2, Gift } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface WheelSegment {
  label: string;
  color: string;
  weight: number;
  promoCode?: string;
}

interface WheelConfig {
  enabled: boolean;
  delaySeconds: number;
  frequencyDays: number;
  title: string;
  subtitle: string;
  segments: WheelSegment[];
}

const defaultConfig: WheelConfig = {
  enabled: true,
  delaySeconds: 5,
  frequencyDays: 7,
  title: "🎰 Roue de la Fortune",
  subtitle: "Tourne la roue et gagne jusqu'à -20% ou une livraison offerte !",
  segments: [
    { label: "-10%", color: "#00D4E8", weight: 30 },
    { label: "Livraison Offerte", color: "#FF6B8A", weight: 25 },
    { label: "-15% dès 50€", color: "#0085A1", weight: 20 },
    { label: "Bracelet Offert", color: "#FFD700", weight: 15 },
    { label: "-20%", color: "#FF6B8A", weight: 10 },
  ],
};

export default function AdminRouePage() {
  const [config, setConfig] = useState<WheelConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [promoCodes, setPromoCodes] = useState<string[]>([]);
  const supabase = createClient();

  useEffect(() => {
    loadConfig();
    loadPromoCodes();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "spin_wheel_config")
      .maybeSingle();

    if (data?.value) {
      setConfig({ ...defaultConfig, ...(data.value as Partial<WheelConfig>) });
    }
    setLoading(false);
  };

  const loadPromoCodes = async () => {
    const { data } = await supabase.from("promo_codes").select("code").eq("active", true);
    setPromoCodes((data || []).map((p: any) => p.code));
  };

  const totalWeight = config.segments.reduce((sum, s) => sum + s.weight, 0);

  const updateSegment = (index: number, field: keyof WheelSegment, value: any) => {
    setConfig((prev) => ({
      ...prev,
      segments: prev.segments.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
    }));
  };

  const addSegment = () => {
    setConfig((prev) => ({
      ...prev,
      segments: [...prev.segments, { label: "Nouveau lot", color: "#00D4E8", weight: 10 }],
    }));
  };

  const removeSegment = (index: number) => {
    if (config.segments.length <= 2) {
      setError("Il faut garder au moins 2 lots sur la roue.");
      return;
    }
    setConfig((prev) => ({ ...prev, segments: prev.segments.filter((_, i) => i !== index) }));
  };

  const saveConfig = async () => {
    setSaving(true);
    setError("");

    const { error: upsertError } = await supabase.from("site_settings").upsert({
      key: "spin_wheel_config",
      value: config,
      updated_at: new Date().toISOString(),
    });

    setSaving(false);
    if (upsertError) {
      setError("Erreur de sauvegarde : " + upsertError.message);
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-sm-dark flex items-center gap-2">
              <Gift className="w-7 h-7 text-sm-cyan" /> Roue de la Fortune
            </h1>
            <p className="text-sm-gray">Réglages du popup, des lots et de leurs probabilités</p>
          </div>
          <button onClick={saveConfig} disabled={saving}
            className="flex items-center gap-2 bg-green-500 text-white font-semibold px-6 py-3 rounded-xl hover:bg-green-600 transition-colors disabled:opacity-60">
            <Save className="w-4 h-4" /> {saving ? "Sauvegarde..." : "Sauvegarder"}
          </button>
        </div>

        {saved && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-green-50 text-green-700 rounded-xl text-sm font-medium">
            ✅ Réglages sauvegardés !
          </motion.div>
        )}
        {error && <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm font-medium">⚠️ {error}</div>}
        {loading && <div className="bg-white rounded-2xl p-12 text-center border border-sm-lightgray text-sm-gray">Chargement...</div>}

        {/* Activation & apparition */}
        <div className="bg-white rounded-2xl p-6 border border-sm-lightgray space-y-4">
          <h2 className="font-bold text-sm-dark">Apparition</h2>

          <label className="flex items-center gap-3">
            <input type="checkbox" checked={config.enabled}
              onChange={(e) => setConfig((p) => ({ ...p, enabled: e.target.checked }))}
              className="w-5 h-5 accent-sm-cyan" />
            <span className="text-sm-dark">Roue activée sur le site</span>
          </label>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-sm-dark mb-1">Délai avant apparition (secondes)</label>
              <input type="number" min={0} value={config.delaySeconds}
                onChange={(e) => setConfig((p) => ({ ...p, delaySeconds: Number(e.target.value) }))}
                className="w-full px-4 py-2.5 rounded-xl border border-sm-lightgray focus:border-sm-cyan outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-sm-dark mb-1">Fréquence d'affichage (jours, par visiteur / IP)</label>
              <input type="number" min={1} value={config.frequencyDays}
                onChange={(e) => setConfig((p) => ({ ...p, frequencyDays: Number(e.target.value) }))}
                className="w-full px-4 py-2.5 rounded-xl border border-sm-lightgray focus:border-sm-cyan outline-none text-sm" />
              <p className="text-xs text-sm-gray mt-1">7 = un même visiteur ne la reverra pas avant 7 jours.</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-sm-dark mb-1">Titre du popup</label>
            <input type="text" value={config.title}
              onChange={(e) => setConfig((p) => ({ ...p, title: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-sm-lightgray focus:border-sm-cyan outline-none text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-sm-dark mb-1">Sous-titre</label>
            <input type="text" value={config.subtitle}
              onChange={(e) => setConfig((p) => ({ ...p, subtitle: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-sm-lightgray focus:border-sm-cyan outline-none text-sm" />
          </div>
        </div>

        {/* Lots */}
        <div className="bg-white rounded-2xl p-6 border border-sm-lightgray space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm-dark">
              Lots ({config.segments.length}) — probabilité totale : {totalWeight}
              {totalWeight !== 100 && <span className="text-yellow-600 text-xs font-normal ml-2">(idéalement 100 au total, mais ce n'est pas obligatoire — les poids sont relatifs entre eux)</span>}
            </h2>
            <button onClick={addSegment} className="flex items-center gap-1 text-sm-cyan text-sm font-semibold hover:underline">
              <Plus className="w-4 h-4" /> Ajouter un lot
            </button>
          </div>

          <div className="space-y-3">
            {config.segments.map((segment, i) => (
              <div key={i} className="grid grid-cols-2 sm:grid-cols-5 gap-3 items-center p-3 bg-sm-cream rounded-xl">
                <input type="text" value={segment.label} placeholder="Libellé (ex: -10%)"
                  onChange={(e) => updateSegment(i, "label", e.target.value)}
                  className="px-3 py-2 rounded-lg border border-sm-lightgray focus:border-sm-cyan outline-none text-sm" />
                <input type="color" value={segment.color}
                  onChange={(e) => updateSegment(i, "color", e.target.value)}
                  className="w-full h-10 rounded-lg border border-sm-lightgray cursor-pointer" />
                <div>
                  <input type="number" min={1} value={segment.weight} placeholder="Probabilité"
                    onChange={(e) => updateSegment(i, "weight", Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-sm-lightgray focus:border-sm-cyan outline-none text-sm" />
                  <p className="text-[10px] text-sm-gray mt-0.5">{totalWeight > 0 ? Math.round((segment.weight / totalWeight) * 100) : 0}% de chance</p>
                </div>
                <select value={segment.promoCode || ""} onChange={(e) => updateSegment(i, "promoCode", e.target.value || undefined)}
                  className="px-3 py-2 rounded-lg border border-sm-lightgray focus:border-sm-cyan outline-none text-sm bg-white">
                  <option value="">Aucun code lié</option>
                  {promoCodes.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <button onClick={() => removeSegment(i)}
                  className="p-2 hover:bg-red-50 rounded-lg text-red-400 hover:text-red-600 transition-colors justify-self-end">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <p className="text-xs text-sm-gray">
            Astuce : crée d'abord tes codes dans <strong>Codes promo</strong>, puis reviens ici pour les associer à un lot — le client verra alors le vrai code à utiliser après avoir tourné la roue.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}

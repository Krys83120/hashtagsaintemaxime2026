"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { motion, AnimatePresence } from "framer-motion";
import { Save, Plus, Trash2, ChevronDown, ChevronUp, Palette, Tags } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Category {
  id?: string;
  name: string;
  slug: string;
  color: string;
  count: number;
  description: string;
  image: string;
  active: boolean;
}

const emptyCategory = (): Category => ({
  name: "Nouvelle Catégorie",
  slug: `categorie-${Date.now()}`,
  color: "bg-sm-cyan",
  count: 0,
  description: "",
  image: "",
  active: true,
});

const colorOptions = [
  { label: "Cyan", value: "bg-sm-cyan", hex: "#00D4E8" },
  { label: "Corail", value: "bg-sm-coral", hex: "#FF6B8A" },
  { label: "Profond", value: "bg-sm-deep", hex: "#0085A1" },
  { label: "Vert", value: "bg-green-500", hex: "#10B981" },
  { label: "Violet", value: "bg-purple-500", hex: "#8B5CF6" },
  { label: "Orange", value: "bg-orange-500", hex: "#F97316" },
  { label: "Rose", value: "bg-pink-500", hex: "#EC4899" },
  { label: "Noir", value: "bg-sm-dark", hex: "#1E293B" },
];

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    const { data: cats, error: catsError } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });

    if (catsError) {
      setError("Erreur de chargement : " + catsError.message);
      setLoading(false);
      return;
    }

    // Compte les produits par catégorie (par slug)
    const { data: prods } = await supabase.from("products").select("category");
    const counts: Record<string, number> = {};
    (prods || []).forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });

    setCategories(
      (cats || []).map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        color: c.color,
        description: c.description || "",
        image: c.image || "",
        active: c.active,
        count: counts[c.slug] || 0,
      }))
    );
    setLoading(false);
  };

  const updateCategory = (slug: string, field: keyof Category, value: any) => {
    setCategories((prev) =>
      prev.map((c) => (c.slug === slug ? { ...c, [field]: value } : c))
    );
  };

  const addCategory = () => {
    const fresh = emptyCategory();
    setCategories((prev) => [...prev, fresh]);
    setExpanded(fresh.slug);
  };

  const deleteCategory = async (cat: Category) => {
    if (!confirm("Supprimer cette catégorie ? Les produits associés perdront leur catégorie.")) return;
    if (cat.id) {
      const { error: delError } = await supabase.from("categories").delete().eq("id", cat.id);
      if (delError) {
        setError("Erreur de suppression : " + delError.message);
        return;
      }
    }
    setCategories((prev) => prev.filter((c) => c.slug !== cat.slug));
  };

  const saveCategories = async () => {
    setSaving(true);
    setError("");

    const rows = categories.map((c, index) => ({
      id: c.id, // undefined pour les nouvelles catégories -> Supabase génère l'UUID
      name: c.name,
      slug: c.slug,
      color: c.color,
      description: c.description,
      image: c.image,
      active: c.active,
      sort_order: index,
    }));

    const { error: upsertError } = await supabase
      .from("categories")
      .upsert(rows, { onConflict: "slug" });

    setSaving(false);

    if (upsertError) {
      setError("Erreur de sauvegarde : " + upsertError.message);
      return;
    }

    await loadCategories();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-sm-dark">🏷️ Catégories</h1>
            <p className="text-sm-gray">Gère les catégories de produits du site</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={addCategory}
              className="flex items-center gap-2 bg-sm-cyan text-white font-semibold px-4 py-2.5 rounded-xl hover:bg-sm-deep transition-colors"
            >
              <Plus className="w-4 h-4" />
              Ajouter
            </button>
            <button
              onClick={saveCategories}
              disabled={saving}
              className="flex items-center gap-2 bg-green-500 text-white font-semibold px-4 py-2.5 rounded-xl hover:bg-green-600 transition-colors disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              {saving ? "Sauvegarde..." : "Sauvegarder"}
            </button>
          </div>
        </div>

        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-green-50 text-green-700 rounded-xl text-sm font-medium"
          >
            ✅ Catégories sauvegardées ! Elles sont maintenant visibles sur le site.
          </motion.div>
        )}

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm font-medium">
            ⚠️ {error}
          </div>
        )}

        {loading && (
          <div className="bg-white rounded-2xl p-12 text-center border border-sm-lightgray text-sm-gray">
            Chargement des catégories...
          </div>
        )}

        <div className="space-y-3">
          {categories.map((cat) => {
            const isOpen = expanded === cat.slug;
            return (
              <div
                key={cat.slug}
                className={`bg-white rounded-2xl border transition-all ${
                  isOpen ? "border-sm-cyan shadow-md" : "border-sm-lightgray shadow-sm"
                }`}
              >
                {/* Header row */}
                <div
                  className="flex items-center gap-4 p-4 cursor-pointer"
                  onClick={() => setExpanded(isOpen ? null : cat.slug)}
                >
                  <div className={`w-10 h-10 ${cat.color} rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                    {cat.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={cat.name}
                        onChange={(e) => updateCategory(cat.slug, "name", e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="font-semibold text-sm-dark bg-transparent border-b border-transparent hover:border-sm-lightgray focus:border-sm-cyan outline-none px-1 -mx-1"
                      />
                      <span className="text-xs text-sm-gray bg-sm-cream px-2 py-0.5 rounded-full">
                        {cat.count} produits
                      </span>
                      {!cat.active && (
                        <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                          Masquée
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-sm-gray truncate">/{cat.slug}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateCategory(cat.slug, "active", !cat.active);
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                        cat.active
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {cat.active ? "Active" : "Masquée"}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteCategory(cat);
                      }}
                      className="p-1.5 hover:bg-red-50 rounded-lg text-red-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {isOpen ? <ChevronUp className="w-5 h-5 text-sm-gray" /> : <ChevronDown className="w-5 h-5 text-sm-gray" />}
                  </div>
                </div>

                {/* Expanded detail */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-0 border-t border-sm-lightgray/50 space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4 pt-4">
                          <div>
                            <label className="block text-xs font-medium text-sm-gray mb-1">Slug (URL)</label>
                            <input
                              type="text"
                              value={cat.slug}
                              onChange={(e) => updateCategory(cat.slug, "slug", slugify(e.target.value))}
                              className="w-full px-3 py-2 rounded-xl border border-sm-lightgray focus:border-sm-cyan outline-none text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-sm-gray mb-1">Image de couverture (URL)</label>
                            <input
                              type="text"
                              value={cat.image}
                              onChange={(e) => updateCategory(cat.slug, "image", e.target.value)}
                              placeholder="/images/category-xxx.jpg"
                              className="w-full px-3 py-2 rounded-xl border border-sm-lightgray focus:border-sm-cyan outline-none text-sm"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-sm-gray mb-1">Description</label>
                          <input
                            type="text"
                            value={cat.description}
                            onChange={(e) => updateCategory(cat.slug, "description", e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-sm-lightgray focus:border-sm-cyan outline-none text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-sm-gray mb-2">Couleur du badge</label>
                          <div className="flex flex-wrap gap-2">
                            {colorOptions.map((opt) => (
                              <button
                                key={opt.value}
                                onClick={() => updateCategory(cat.slug, "color", opt.value)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                                  cat.color === opt.value
                                    ? "border-sm-cyan bg-sm-cyan/10 text-sm-cyan ring-2 ring-sm-cyan/20"
                                    : "border-sm-lightgray text-sm-gray hover:border-sm-cyan/50"
                                }`}
                              >
                                <span
                                  className={`w-4 h-4 rounded-full ${opt.value}`}
                                  style={{ backgroundColor: opt.hex }}
                                />
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {!loading && categories.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center border border-sm-lightgray">
            <Tags className="w-12 h-12 text-sm-gray mx-auto mb-3" />
            <p className="text-sm-gray">Aucune catégorie. Ajoute-en une !</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function slugify(text: string) {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

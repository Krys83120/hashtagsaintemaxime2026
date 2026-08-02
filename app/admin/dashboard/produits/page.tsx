"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { motion } from "framer-motion";
import { Save, Plus, Trash2, Search, Filter, ChevronDown, ChevronUp, ImageIcon, Package } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface AdminProduct {
  id: string; // UUID Supabase, ou id temporaire "new-..." avant la 1ère sauvegarde
  slug: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  categories: string[];
  image: string;
  images: string[];
  badge: string;
  description: string;
  details: string[];
  colors: { name: string; hex: string }[];
  sizes: string[];
  inStock: boolean;
  stockCount: number;
  source?: string;
  printfulId?: string;
}

const badgeOptions = ["", "BESTSELLER", "ÉDITION LIMITÉE", "NOUVEAU", "TENDANCE", "SOLDES", "EXCLUSIF"];

function fromDbRow(row: any): AdminProduct {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    price: Number(row.price),
    originalPrice: row.original_price != null ? Number(row.original_price) : undefined,
    category: row.category,
    categories: Array.isArray(row.categories) && row.categories.length ? row.categories : [row.category].filter(Boolean),
    image: row.image || "",
    images: row.images || [],
    badge: row.badge || "",
    description: row.description || "",
    details: row.details || [],
    colors: row.colors || [],
    sizes: row.sizes || [],
    inStock: row.in_stock,
    stockCount: row.stock_count || 0,
    source: row.source,
    printfulId: row.printful_id,
  };
}

function toDbRow(p: AdminProduct) {
  return {
    id: p.id.startsWith("new-") ? undefined : p.id,
    slug: p.slug,
    name: p.name,
    price: p.price,
    original_price: p.originalPrice ?? null,
    category: p.categories[0] || p.category,
    categories: p.categories,
    image: p.image,
    images: p.images,
    badge: p.badge || null,
    description: p.description,
    details: p.details,
    colors: p.colors,
    sizes: p.sizes,
    in_stock: p.inStock,
    stock_count: p.stockCount,
    source: p.source || "manual",
    printful_id: p.printfulId || null,
  };
}

export default function AdminProduitsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const supabase = createClient();

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const { data } = await supabase.from("categories").select("slug").order("sort_order", { ascending: true });
    setCategories((data || []).map((c: any) => c.slug));
  };

  const loadProducts = async () => {
    setLoading(true);
    const { data, error: loadError } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (loadError) {
      setError("Erreur de chargement : " + loadError.message);
    } else {
      setProducts((data || []).map(fromDbRow));
    }
    setLoading(false);
  };

  const filtered = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.slug.includes(search.toLowerCase());
    const matchesCategory = !filterCategory || p.categories.includes(filterCategory);
    return matchesSearch && matchesCategory;
  });

  const updateProduct = (id: string, field: keyof AdminProduct, value: any) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const toggleProductCategory = (id: string, categorySlug: string) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const has = p.categories.includes(categorySlug);
        const nextCategories = has
          ? p.categories.filter((c) => c !== categorySlug)
          : [...p.categories, categorySlug];
        // Toujours garder au moins une catégorie cochée
        return nextCategories.length ? { ...p, categories: nextCategories } : p;
      })
    );
  };

  const saveProducts = async () => {
    setSaving(true);
    setError("");

    const rows = products.map(toDbRow);
    const { error: upsertError } = await supabase
      .from("products")
      .upsert(rows, { onConflict: "slug" });

    setSaving(false);

    if (upsertError) {
      setError("Erreur de sauvegarde : " + upsertError.message);
      return;
    }

    await loadProducts();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const addProduct = () => {
    const tempId = `new-${Date.now()}`;
    const newProduct: AdminProduct = {
      id: tempId,
      slug: `nouveau-produit-${Date.now()}`,
      name: "Nouveau Produit",
      price: 0,
      category: categories[0] || "accessoires",
      categories: categories[0] ? [categories[0]] : ["accessoires"],
      image: "/images/product-placeholder.jpg",
      images: [],
      badge: "",
      description: "",
      details: [],
      colors: [{ name: "Blanc", hex: "#FFFFFF" }],
      sizes: ["One Size"],
      inStock: true,
      stockCount: 0,
      source: "manual",
    };
    setProducts((prev) => [...prev, newProduct]);
    setEditingId(newProduct.id);
  };

  const deleteProduct = async (p: AdminProduct) => {
    if (!confirm("Supprimer ce produit ?")) return;
    if (!p.id.startsWith("new-")) {
      const { error: delError } = await supabase.from("products").delete().eq("id", p.id);
      if (delError) {
        setError("Erreur de suppression : " + delError.message);
        return;
      }
    }
    setProducts((prev) => prev.filter((prod) => prod.id !== p.id));
    if (editingId === p.id) setEditingId(null);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-sm-dark">📦 Produits</h1>
            <p className="text-sm-gray">{products.length} produits au total</p>
          </div>
          <div className="flex gap-3">
            <button onClick={addProduct} className="flex items-center gap-2 bg-sm-cyan text-white font-semibold px-4 py-2.5 rounded-xl hover:bg-sm-deep transition-colors">
              <Plus className="w-4 h-4" /> Ajouter
            </button>
            <button onClick={saveProducts} disabled={saving} className="flex items-center gap-2 bg-green-500 text-white font-semibold px-4 py-2.5 rounded-xl hover:bg-green-600 transition-colors disabled:opacity-60">
              <Save className="w-4 h-4" /> {saving ? "Sauvegarde..." : "Sauvegarder"}
            </button>
          </div>
        </div>

        {saved && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-green-50 text-green-700 rounded-xl text-sm font-medium">
            ✅ Produits sauvegardés ! Ils sont maintenant visibles sur le site.
          </motion.div>
        )}

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm font-medium">⚠️ {error}</div>
        )}

        {loading && (
          <div className="bg-white rounded-2xl p-12 text-center border border-sm-lightgray text-sm-gray">
            Chargement des produits...
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sm-gray" />
            <input
              type="text" placeholder="Rechercher un produit..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-sm-lightgray focus:border-sm-cyan outline-none text-sm"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sm-gray" />
            <select
              value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
              className="pl-10 pr-8 py-2.5 rounded-xl border border-sm-lightgray focus:border-sm-cyan outline-none text-sm bg-white appearance-none"
            >
              <option value="">Toutes les catégories</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Product list */}
        <div className="space-y-3">
          {filtered.map((p) => {
            const isEditing = editingId === p.id;
            return (
              <div key={p.id} className={`bg-white rounded-2xl border transition-all ${isEditing ? "border-sm-cyan shadow-md" : "border-sm-lightgray shadow-sm"}`}>
                {/* Summary row */}
                <div className="flex items-center gap-4 p-4 cursor-pointer" onClick={() => setEditingId(isEditing ? null : p.id)}>
                  <div className="w-14 h-14 rounded-xl bg-sm-cream overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {p.image ? (
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-sm-gray" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm-dark truncate">{p.name}</span>
                      {p.badge && (
                        <span className="text-[10px] font-bold bg-sm-cyan/10 text-sm-cyan px-2 py-0.5 rounded-full">{p.badge}</span>
                      )}
                      {p.source === "manual" && (
                        <span className="text-[10px] bg-sm-coral/10 text-sm-coral px-2 py-0.5 rounded-full">Manuel</span>
                      )}
                      {p.printfulId && (
                        <span className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full">Printful</span>
                      )}
                    </div>
                    <p className="text-xs text-sm-gray">{p.price}€ · {p.categories.join(", ")} · Stock: {p.stockCount} · {p.inStock ? "✅ En stock" : "❌ Rupture"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={(e) => { e.stopPropagation(); updateProduct(p.id, "inStock", !p.inStock); }}
                      className={`px-2 py-1 rounded-lg text-xs font-bold ${p.inStock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {p.inStock ? "Stock" : "Rupture"}
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); deleteProduct(p); }}
                      className="p-1.5 hover:bg-red-50 rounded-lg text-red-400 hover:text-red-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {isEditing ? <ChevronUp className="w-5 h-5 text-sm-gray" /> : <ChevronDown className="w-5 h-5 text-sm-gray" />}
                  </div>
                </div>

                {/* Edit form */}
                {isEditing && (
                  <div className="px-4 pb-4 pt-0 border-t border-sm-lightgray/50">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                      <div className="lg:col-span-2">
                        <label className="block text-xs font-medium text-sm-gray mb-1">Nom du produit</label>
                        <input type="text" value={p.name}
                          onChange={(e) => updateProduct(p.id, "name", e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-sm-lightgray focus:border-sm-cyan outline-none text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-sm-gray mb-1">Slug</label>
                        <input type="text" value={p.slug}
                          onChange={(e) => updateProduct(p.id, "slug", slugify(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl border border-sm-lightgray focus:border-sm-cyan outline-none text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-sm-gray mb-1">Prix (€)</label>
                        <input type="number" step="0.01" value={p.price}
                          onChange={(e) => updateProduct(p.id, "price", parseFloat(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl border border-sm-lightgray focus:border-sm-cyan outline-none text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-sm-gray mb-1">Prix barré (€)</label>
                        <input type="number" step="0.01" value={p.originalPrice || ""}
                          onChange={(e) => updateProduct(p.id, "originalPrice", e.target.value ? parseFloat(e.target.value) : undefined)}
                          className="w-full px-3 py-2 rounded-xl border border-sm-lightgray focus:border-sm-cyan outline-none text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-sm-gray mb-1">Badge</label>
                        <select value={p.badge} onChange={(e) => updateProduct(p.id, "badge", e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-sm-lightgray focus:border-sm-cyan outline-none text-sm bg-white">
                          {badgeOptions.map((b) => <option key={b} value={b}>{b || "Aucun"}</option>)}
                        </select>
                      </div>
                      <div className="lg:col-span-2">
                        <label className="block text-xs font-medium text-sm-gray mb-1">
                          Catégories (coche-en plusieurs pour un produit mixte, ex: unisexe)
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {categories.map((c) => {
                            const checked = p.categories.includes(c);
                            return (
                              <label
                                key={c}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                                  checked ? "bg-sm-cyan/10 border-sm-cyan text-sm-cyan" : "border-sm-lightgray text-sm-gray hover:border-sm-cyan"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => toggleProductCategory(p.id, c)}
                                  className="w-3.5 h-3.5 accent-sm-cyan"
                                />
                                {c}
                              </label>
                            );
                          })}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-sm-gray mb-1">Stock</label>
                        <input type="number" value={p.stockCount}
                          onChange={(e) => updateProduct(p.id, "stockCount", parseInt(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl border border-sm-lightgray focus:border-sm-cyan outline-none text-sm" />
                      </div>
                      <div className="lg:col-span-3">
                        <label className="block text-xs font-medium text-sm-gray mb-2">
                          Photos ({p.images.length}) — clique sur ⭐ pour définir l'image principale, sur 🗑️ pour retirer une photo que tu ne veux pas garder
                        </label>
                        <div className="flex flex-wrap gap-3">
                          {p.images.map((img, idx) => (
                            <div key={idx} className={`relative group w-24 h-24 rounded-xl overflow-hidden border-2 ${img === p.image ? "border-sm-cyan" : "border-sm-lightgray"}`}>
                              <img src={img} alt={`${p.name} ${idx + 1}`} className="w-full h-full object-cover" />
                              {img === p.image && (
                                <span className="absolute top-1 left-1 bg-sm-cyan text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                                  Principale
                                </span>
                              )}
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100">
                                <button
                                  type="button"
                                  title="Définir comme image principale"
                                  onClick={() => updateProduct(p.id, "image", img)}
                                  className="w-7 h-7 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-sm"
                                >
                                  ⭐
                                </button>
                                <button
                                  type="button"
                                  title="Retirer cette photo"
                                  onClick={() => {
                                    const nextImages = p.images.filter((_, i) => i !== idx);
                                    updateProduct(p.id, "images", nextImages);
                                    // Si on retire l'image principale, on bascule sur la suivante disponible
                                    if (img === p.image) {
                                      updateProduct(p.id, "image", nextImages[0] || "");
                                    }
                                  }}
                                  className="w-7 h-7 rounded-full bg-white/90 hover:bg-red-500 hover:text-white flex items-center justify-center text-xs"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                          {p.images.length === 0 && (
                            <div className="w-24 h-24 rounded-xl border-2 border-dashed border-sm-lightgray flex items-center justify-center text-sm-gray">
                              <ImageIcon className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 mt-3">
                          <input
                            type="text"
                            placeholder="Coller une URL d'image et Entrée pour l'ajouter"
                            onKeyDown={(e) => {
                              const target = e.target as HTMLInputElement;
                              if (e.key === "Enter" && target.value.trim()) {
                                e.preventDefault();
                                const url = target.value.trim();
                                const nextImages = [...p.images, url];
                                updateProduct(p.id, "images", nextImages);
                                if (!p.image) updateProduct(p.id, "image", url);
                                target.value = "";
                              }
                            }}
                            className="flex-1 px-3 py-2 rounded-xl border border-sm-lightgray focus:border-sm-cyan outline-none text-sm"
                          />
                        </div>
                      </div>
                      <div className="lg:col-span-3">
                        <label className="block text-xs font-medium text-sm-gray mb-1">Description</label>
                        <textarea value={p.description} rows={3}
                          onChange={(e) => updateProduct(p.id, "description", e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-sm-lightgray focus:border-sm-cyan outline-none text-sm resize-none" />
                      </div>
                      <div className="lg:col-span-3">
                        <label className="block text-xs font-medium text-sm-gray mb-1">Détails (un par ligne)</label>
                        <textarea value={p.details.join("\n")} rows={3}
                          onChange={(e) => updateProduct(p.id, "details", e.target.value.split("\n").filter(Boolean))}
                          className="w-full px-3 py-2 rounded-xl border border-sm-lightgray focus:border-sm-cyan outline-none text-sm resize-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-sm-gray mb-1">Tailles (séparées par virgule)</label>
                        <input type="text" value={p.sizes.join(", ")}
                          onChange={(e) => updateProduct(p.id, "sizes", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
                          className="w-full px-3 py-2 rounded-xl border border-sm-lightgray focus:border-sm-cyan outline-none text-sm" />
                      </div>
                      <div className="lg:col-span-2">
                        <label className="block text-xs font-medium text-sm-gray mb-1">Couleurs (format: Nom#HEX, séparées par virgule)</label>
                        <input type="text"
                          value={p.colors.map((c) => `${c.name}#${c.hex}`).join(", ")}
                          onChange={(e) => {
                            const cols = e.target.value.split(",").map((s) => {
                              const [name, hex] = s.trim().split("#");
                              return name && hex ? { name: name.trim(), hex: `#${hex.trim()}` } : null;
                            }).filter(Boolean);
                            updateProduct(p.id, "colors", cols.length ? cols : [{ name: "Blanc", hex: "#FFFFFF" }]);
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-sm-lightgray focus:border-sm-cyan outline-none text-sm"
                        />
                        <div className="flex gap-2 mt-2">
                          {p.colors.map((c) => (
                            <span key={c.name} className="inline-flex items-center gap-1 text-xs bg-sm-cream px-2 py-1 rounded-lg">
                              <span className="w-3 h-3 rounded-full border border-sm-lightgray" style={{ backgroundColor: c.hex }} />
                              {c.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {!loading && filtered.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center border border-sm-lightgray">
            <Package className="w-12 h-12 text-sm-gray mx-auto mb-3" />
            <p className="text-sm-gray">Aucun produit trouvé.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function slugify(text: string) {
  return text.toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { motion } from "framer-motion";
import { Save, Globe, Instagram, Facebook, Mail, Phone, MapPin, ExternalLink, Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface LinkItem {
  id?: string; // UUID Supabase, absent pour un lien pas encore sauvegardé
  label: string;
  url: string;
  icon: string;
  active: boolean;
  section: "header" | "footer" | "social" | "contact" | "legal";
}

function fromDbRow(row: any): LinkItem {
  return { id: row.id, label: row.label, url: row.url, icon: row.icon || "link", active: row.active, section: row.type };
}

export default function AdminLiensPage() {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newLink, setNewLink] = useState({ label: "", url: "", section: "header" as LinkItem["section"] });
  const supabase = createClient();

  useEffect(() => {
    loadLinks();
  }, []);

  const loadLinks = async () => {
    setLoading(true);
    const { data, error: loadError } = await supabase.from("links").select("*").order("sort_order", { ascending: true });
    if (loadError) {
      setError("Erreur de chargement : " + loadError.message);
    } else {
      setLinks((data || []).map(fromDbRow));
    }
    setLoading(false);
  };

  const saveLinks = async () => {
    setSaving(true);
    setError("");

    const rows = links.map((l, index) => ({
      id: l.id,
      label: l.label,
      url: l.url,
      icon: l.icon,
      active: l.active,
      type: l.section,
      sort_order: index,
    }));

    const { error: upsertError } = await supabase.from("links").upsert(rows);
    setSaving(false);

    if (upsertError) {
      setError("Erreur de sauvegarde : " + upsertError.message);
      return;
    }

    await loadLinks();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const updateLink = (id: string | undefined, field: keyof LinkItem, value: any) => {
    setLinks((prev) => prev.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
  };

  const addLink = () => {
    if (!newLink.label || !newLink.url) return;
    const link: LinkItem = {
      id: crypto.randomUUID(),
      label: newLink.label,
      url: newLink.url,
      icon: "link",
      active: true,
      section: newLink.section,
    };
    setLinks((prev) => [...prev, link]);
    setNewLink({ label: "", url: "", section: "header" });
    setShowAdd(false);
  };

  const deleteLink = async (link: LinkItem) => {
    if (!confirm("Supprimer ce lien ?")) return;
    if (link.id) {
      const { error: delError } = await supabase.from("links").delete().eq("id", link.id);
      if (delError) {
        setError("Erreur de suppression : " + delError.message);
        return;
      }
    }
    setLinks((prev) => prev.filter((l) => l !== link));
  };

  const sections: { key: LinkItem["section"]; label: string }[] = [
    { key: "header", label: "🧭 Navigation principale" },
    { key: "footer", label: "📋 Liens Footer" },
    { key: "social", label: "📱 Réseaux Sociaux" },
    { key: "contact", label: "📇 Contact" },
    { key: "legal", label: "⚖️ Légal" },
  ];

  const iconMap: Record<string, React.ReactNode> = {
    instagram: <Instagram className="w-4 h-4" />,
    facebook: <Facebook className="w-4 h-4" />,
    mail: <Mail className="w-4 h-4" />,
    phone: <Phone className="w-4 h-4" />,
    map: <MapPin className="w-4 h-4" />,
    globe: <Globe className="w-4 h-4" />,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-sm-dark">🔗 Liens & Réseaux</h1>
            <p className="text-sm-gray">Gère les liens, réseaux sociaux et contacts du site</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowAdd(!showAdd)}
              className="flex items-center gap-2 bg-sm-cyan text-white font-semibold px-4 py-2.5 rounded-xl hover:bg-sm-deep transition-colors">
              <Plus className="w-4 h-4" /> Ajouter
            </button>
            <button onClick={saveLinks} disabled={saving}
              className="flex items-center gap-2 bg-green-500 text-white font-semibold px-4 py-2.5 rounded-xl hover:bg-green-600 transition-colors disabled:opacity-60">
              <Save className="w-4 h-4" /> {saving ? "Sauvegarde..." : "Sauvegarder"}
            </button>
          </div>
        </div>

        {saved && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-green-50 text-green-700 rounded-xl text-sm font-medium">
            ✅ Liens sauvegardés !
          </motion.div>
        )}

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm font-medium">⚠️ {error}</div>
        )}

        {loading && (
          <div className="bg-white rounded-2xl p-12 text-center border border-sm-lightgray text-sm-gray">
            Chargement des liens...
          </div>
        )}

        {/* Add form */}
        {showAdd && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            className="bg-white rounded-2xl p-6 border border-sm-lightgray space-y-4 overflow-hidden">
            <h3 className="font-semibold text-sm-dark">Nouveau lien</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <input type="text" placeholder="Label (ex: Instagram)" value={newLink.label}
                onChange={(e) => setNewLink((p) => ({ ...p, label: e.target.value }))}
                className="px-4 py-2.5 rounded-xl border border-sm-lightgray focus:border-sm-cyan outline-none text-sm" />
              <input type="text" placeholder="URL (ex: https://...)" value={newLink.url}
                onChange={(e) => setNewLink((p) => ({ ...p, url: e.target.value }))}
                className="px-4 py-2.5 rounded-xl border border-sm-lightgray focus:border-sm-cyan outline-none text-sm" />
              <select value={newLink.section}
                onChange={(e) => setNewLink((p) => ({ ...p, section: e.target.value as any }))}
                className="px-4 py-2.5 rounded-xl border border-sm-lightgray focus:border-sm-cyan outline-none text-sm bg-white">
                {sections.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
            </div>
            <div className="flex gap-3">
              <button onClick={addLink}
                className="bg-green-500 text-white font-semibold px-6 py-2 rounded-xl hover:bg-green-600 transition-colors">
                Ajouter
              </button>
              <button onClick={() => setShowAdd(false)}
                className="bg-sm-lightgray text-sm-dark font-semibold px-6 py-2 rounded-xl hover:bg-sm-gray/20 transition-colors">
                Annuler
              </button>
            </div>
          </motion.div>
        )}

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section) => {
            const sectionLinks = links.filter((l) => l.section === section.key);
            return (
              <div key={section.key} className="bg-white rounded-2xl border border-sm-lightgray overflow-hidden">
                <div className="px-6 py-4 border-b border-sm-lightgray bg-sm-cream/50">
                  <h2 className="font-semibold text-sm-dark">{section.label}</h2>
                  <p className="text-xs text-sm-gray">{sectionLinks.filter((l) => l.active).length} actif(s) sur {sectionLinks.length}</p>
                </div>
                <div className="divide-y divide-sm-lightgray/50">
                  {sectionLinks.map((link, i) => (
                    <div key={link.id || `new-${i}`} className="flex items-center gap-4 px-6 py-3 hover:bg-sm-cream/30 transition-colors">
                      <input type="checkbox" checked={link.active}
                        onChange={(e) => updateLink(link.id, "active", e.target.checked)}
                        className="w-5 h-5 accent-sm-cyan flex-shrink-0" />
                      <div className="w-8 h-8 rounded-lg bg-sm-cyan/10 flex items-center justify-center text-sm-cyan flex-shrink-0">
                        {iconMap[link.icon] || <Globe className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <input type="text" value={link.label}
                          onChange={(e) => updateLink(link.id, "label", e.target.value)}
                          className="block w-full text-sm font-medium text-sm-dark bg-transparent border-b border-transparent hover:border-sm-lightgray focus:border-sm-cyan outline-none px-1 -mx-1" />
                        <input type="text" value={link.url}
                          onChange={(e) => updateLink(link.id, "url", e.target.value)}
                          className="block w-full text-xs text-sm-gray bg-transparent border-b border-transparent hover:border-sm-lightgray focus:border-sm-cyan outline-none px-1 -mx-1" />
                      </div>
                      <a href={link.url} target="_blank" rel="noopener noreferrer"
                        className="p-1.5 hover:bg-sm-cyan/10 rounded-lg text-sm-cyan transition-colors flex-shrink-0">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button onClick={() => deleteLink(link)}
                        className="p-1.5 hover:bg-red-50 rounded-lg text-red-400 hover:text-red-600 transition-colors flex-shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {sectionLinks.length === 0 && (
                    <div className="px-6 py-4 text-sm text-sm-gray">Aucun lien dans cette section.</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
}

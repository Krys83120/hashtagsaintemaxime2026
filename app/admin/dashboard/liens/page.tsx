"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { motion } from "framer-motion";
import { Save, Globe, Instagram, Facebook, Mail, Phone, MapPin, ExternalLink, Plus, Trash2 } from "lucide-react";

interface LinkItem {
  id: string;
  label: string;
  url: string;
  icon: string;
  active: boolean;
  section: "header" | "footer" | "social" | "contact" | "legal";
}

const defaultLinks: LinkItem[] = [
  { id: "l1", label: "Boutique", url: "/boutique/", icon: "store", active: true, section: "header" },
  { id: "l2", label: "La Marque", url: "/la-marque/", icon: "info", active: true, section: "header" },
  { id: "l3", label: "Le Cœur au Sol", url: "/le-coeur-au-sol/", icon: "heart", active: true, section: "header" },
  { id: "l4", label: "Instagram", url: "https://www.instagram.com/hashtag_saintemaxime/", icon: "instagram", active: true, section: "social" },
  { id: "l5", label: "Facebook", url: "https://www.facebook.com/hashtagsaintemaxime/", icon: "facebook", active: true, section: "social" },
  { id: "l6", label: "TikTok", url: "https://www.tiktok.com/@hashtagsaintemaxime", icon: "tiktok", active: true, section: "social" },
  { id: "l7", label: "Email", url: "mailto:contact@hashtagsaintemaxime.fr", icon: "mail", active: true, section: "contact" },
  { id: "l8", label: "Téléphone", url: "tel:+33494123456", icon: "phone", active: true, section: "contact" },
  { id: "l9", label: "Adresse", url: "#", icon: "map", active: true, section: "contact" },
  { id: "l10", label: "Mentions légales", url: "/mentions-legales/", icon: "file", active: true, section: "legal" },
  { id: "l11", label: "CGV", url: "/cgv/", icon: "file", active: true, section: "legal" },
  { id: "l12", label: "Politique de confidentialité", url: "/confidentialite/", icon: "file", active: true, section: "legal" },
  { id: "l13", label: "Livraison & Retours", url: "/livraison/", icon: "truck", active: true, section: "footer" },
  { id: "l14", label: "Guide des tailles", url: "/guide-tailles/", icon: "ruler", active: true, section: "footer" },
];

export default function AdminLiensPage() {
  const [links, setLinks] = useState<LinkItem[]>(defaultLinks);
  const [saved, setSaved] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newLink, setNewLink] = useState({ label: "", url: "", section: "header" as const });

  useEffect(() => {
    const savedLinks = localStorage.getItem("sm_admin_links");
    if (savedLinks) {
      try { setLinks(JSON.parse(savedLinks)); } catch { /* ignore */ }
    }
  }, []);

  const saveLinks = () => {
    localStorage.setItem("sm_admin_links", JSON.stringify(links));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const updateLink = (id: string, field: keyof LinkItem, value: any) => {
    setLinks((prev) => prev.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
  };

  const addLink = () => {
    if (!newLink.label || !newLink.url) return;
    const link: LinkItem = {
      id: `l-${Date.now()}`,
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

  const deleteLink = (id: string) => {
    if (confirm("Supprimer ce lien ?")) {
      setLinks((prev) => prev.filter((l) => l.id !== id));
    }
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
            <button onClick={saveLinks}
              className="flex items-center gap-2 bg-green-500 text-white font-semibold px-4 py-2.5 rounded-xl hover:bg-green-600 transition-colors">
              <Save className="w-4 h-4" /> Sauvegarder
            </button>
          </div>
        </div>

        {saved && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-green-50 text-green-700 rounded-xl text-sm font-medium">
            ✅ Liens sauvegardés !
          </motion.div>
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
                  {sectionLinks.map((link) => (
                    <div key={link.id} className="flex items-center gap-4 px-6 py-3 hover:bg-sm-cream/30 transition-colors">
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
                      <button onClick={() => deleteLink(link.id)}
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

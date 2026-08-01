"use client";

import { useState, useEffect, useRef } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { motion } from "framer-motion";
import { Upload, Trash2, ImageIcon, Copy, Check, ExternalLink } from "lucide-react";

interface MediaFile {
  id: string;
  name: string;
  url: string;
  type: "image" | "logo" | "icon";
  size: string;
  uploadedAt: string;
  usedIn?: string[];
}

const defaultMedia: MediaFile[] = [
  { id: "m1", name: "logo_saintemaxime.png", url: "/logo_saintemaxime.png", type: "logo", size: "33 KB", uploadedAt: "2026-06-19", usedIn: ["Header", "Footer", "Favicon"] },
  { id: "m2", name: "logo_saintemaxime_3000.png", url: "/logo_saintemaxime_3000.png", type: "logo", size: "3.3 MB", uploadedAt: "2026-06-19", usedIn: ["OG Image", "Print"] },
  { id: "m3", name: "coeur_sol.jpg", url: "/coeur_sol.jpg", type: "image", size: "86 KB", uploadedAt: "2026-06-19", usedIn: ["Le Cœur au Sol"] },
  { id: "m4", name: "product-tshirt.jpg", url: "/images/product-tshirt.jpg", type: "image", size: "—", uploadedAt: "2026-06-19", usedIn: ["Produit T-Shirt"] },
  { id: "m5", name: "product-casquette.jpg", url: "/images/product-casquette.jpg", type: "image", size: "—", uploadedAt: "2026-06-19", usedIn: ["Produit Casquette"] },
  { id: "m6", name: "product-bouteille.jpg", url: "/images/product-bouteille.jpg", type: "image", size: "—", uploadedAt: "2026-06-19", usedIn: ["Produit Bouteille"] },
  { id: "m7", name: "product-serviette.jpg", url: "/images/product-serviette.jpg", type: "image", size: "—", uploadedAt: "2026-06-19", usedIn: ["Produit Serviette"] },
  { id: "m8", name: "product-mug.jpg", url: "/images/product-mug.jpg", type: "image", size: "—", uploadedAt: "2026-06-19", usedIn: ["Produit Mug"] },
  { id: "m9", name: "MOCKUP_HOMEPAGE_SAINTEMAXIME_2026.png", url: "/MOCKUP_HOMEPAGE_SAINTEMAXIME_2026.png", type: "image", size: "266 KB", uploadedAt: "2026-06-19", usedIn: ["Référence design"] },
];

export default function AdminMediasPage() {
  const [media, setMedia] = useState<MediaFile[]>(defaultMedia);
  const [filter, setFilter] = useState<"all" | "image" | "logo">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("sm_admin_media");
    if (saved) {
      try { setMedia(JSON.parse(saved)); } catch { /* ignore */ }
    }
  }, []);

  const filtered = filter === "all" ? media : media.filter((m) => m.type === filter || (filter === "image" && m.type === "image"));

  const copyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const deleteMedia = (id: string) => {
    if (confirm("Supprimer ce fichier de la médiathèque ?")) {
      setMedia((prev) => prev.filter((m) => m.id !== id));
      localStorage.setItem("sm_admin_media", JSON.stringify(media.filter((m) => m.id !== id)));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const newMedia: MediaFile = {
          id: `m-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          name: file.name,
          url: ev.target?.result as string,
          type: file.type.startsWith("image") ? "image" : "icon",
          size: formatBytes(file.size),
          uploadedAt: new Date().toISOString().split("T")[0],
        };
        setMedia((prev) => {
          const updated = [...prev, newMedia];
          localStorage.setItem("sm_admin_media", JSON.stringify(updated));
          return updated;
        });
      };
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-sm-dark">🖼️ Médias & Logos</h1>
            <p className="text-sm-gray">{media.length} fichiers dans la médiathèque</p>
          </div>
          <div className="flex gap-3">
            <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileUpload} className="hidden" />
            <button onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 bg-sm-cyan text-white font-semibold px-4 py-2.5 rounded-xl hover:bg-sm-deep transition-colors">
              <Upload className="w-4 h-4" /> Importer
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {(["all", "image", "logo"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                filter === f ? "bg-sm-cyan text-white" : "bg-white border border-sm-lightgray text-sm-gray hover:border-sm-cyan"
              }`}>
              {f === "all" ? "Tous" : f === "image" ? "Images" : "Logos"}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((m) => (
            <div key={m.id} className="bg-white rounded-2xl border border-sm-lightgray overflow-hidden group hover:shadow-md transition-shadow">
              <div className="aspect-square bg-sm-cream flex items-center justify-center overflow-hidden relative">
                {m.url.startsWith("data:") || m.url.startsWith("/") ? (
                  <img src={m.url} alt={m.name} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-10 h-10 text-sm-gray" />
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button onClick={() => copyUrl(m.url, m.id)}
                    className="p-2 bg-white rounded-full text-sm-dark hover:bg-sm-cyan hover:text-white transition-colors"
                    title="Copier l'URL">
                    {copiedId === m.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button onClick={() => deleteMedia(m.id)}
                    className="p-2 bg-white rounded-full text-sm-dark hover:bg-red-500 hover:text-white transition-colors"
                    title="Supprimer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-3">
                <p className="text-xs font-medium text-sm-dark truncate" title={m.name}>{m.name}</p>
                <p className="text-[10px] text-sm-gray">{m.size} · {m.type} · {m.uploadedAt}</p>
                {m.usedIn && (
                  <p className="text-[10px] text-sm-cyan mt-1">Utilisé dans : {m.usedIn.join(", ")}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center border border-sm-lightgray">
            <ImageIcon className="w-12 h-12 text-sm-gray mx-auto mb-3" />
            <p className="text-sm-gray">Aucun média dans cette catégorie.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { motion } from "framer-motion";
import { Upload, Trash2, ImageIcon, Copy, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface MediaFile {
  id: string;
  name: string;
  url: string;
  storagePath: string;
  type: "image" | "logo" | "icon";
  category: string;
  sizeBytes: number | null;
  uploadedAt: string;
}

function formatBytes(bytes: number | null) {
  if (!bytes) return "—";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export default function AdminMediasPage() {
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "image" | "logo">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    setLoading(true);
    const { data, error: loadError } = await supabase
      .from("media")
      .select("*")
      .order("uploaded_at", { ascending: false });

    if (loadError) {
      setError("Erreur de chargement : " + loadError.message);
    } else {
      setMedia((data || []).map((m: any) => ({
        id: m.id,
        name: m.name,
        url: m.url,
        storagePath: m.category === "logo" ? `logos/${m.name}` : `images/${m.name}`, // fallback, écrasé ci-dessous si stocké
        type: m.type,
        category: m.category,
        sizeBytes: m.size_bytes,
        uploadedAt: m.uploaded_at,
      })));
    }
    setLoading(false);
  };

  const filtered = filter === "all" ? media : media.filter((m) => m.type === filter);

  const copyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const deleteMedia = async (m: MediaFile) => {
    if (!confirm("Supprimer ce fichier de la médiathèque ? Cette action est définitive.")) return;

    // Le chemin de stockage réel est déduit de l'URL publique Supabase
    const marker = "/object/public/media/";
    const idx = m.url.indexOf(marker);
    if (idx !== -1) {
      const path = m.url.slice(idx + marker.length);
      await supabase.storage.from("media").remove([path]);
    }

    const { error: delError } = await supabase.from("media").delete().eq("id", m.id);
    if (delError) {
      setError("Erreur de suppression : " + delError.message);
      return;
    }
    setMedia((prev) => prev.filter((x) => x.id !== m.id));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    setError("");

    for (const file of Array.from(files)) {
      const isLogo = /logo/i.test(file.name);
      const folder = isLogo ? "logos" : "images";
      const cleanName = file.name.toLowerCase().replace(/[^a-z0-9.\-_]/g, "-");
      const path = `${folder}/${Date.now()}-${cleanName}`;

      const { error: uploadError } = await supabase.storage.from("media").upload(path, file, {
        cacheControl: "31536000",
        upsert: false,
      });

      if (uploadError) {
        setError(`Erreur d'upload pour ${file.name} : ${uploadError.message}`);
        continue;
      }

      const { data: publicUrlData } = supabase.storage.from("media").getPublicUrl(path);

      const { error: insertError } = await supabase.from("media").insert({
        name: file.name,
        url: publicUrlData.publicUrl,
        type: isLogo ? "logo" : "image",
        category: isLogo ? "logo" : "general",
        size_bytes: file.size,
      });

      if (insertError) {
        setError(`Erreur d'enregistrement pour ${file.name} : ${insertError.message}`);
      }
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    loadMedia();
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
            <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
              className="flex items-center gap-2 bg-sm-cyan text-white font-semibold px-4 py-2.5 rounded-xl hover:bg-sm-deep transition-colors disabled:opacity-60">
              <Upload className="w-4 h-4" /> {uploading ? "Envoi..." : "Importer"}
            </button>
          </div>
        </div>

        <p className="text-xs text-sm-gray -mt-2">
          Astuce : un fichier dont le nom contient "logo" (ex: <code className="bg-sm-cream px-1 rounded">logo-header.png</code>) est automatiquement classé comme Logo.
        </p>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm font-medium">⚠️ {error}</div>
        )}

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

        {loading && (
          <div className="bg-white rounded-2xl p-12 text-center border border-sm-lightgray text-sm-gray">
            Chargement...
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((m) => (
            <div key={m.id} className="bg-white rounded-2xl border border-sm-lightgray overflow-hidden group hover:shadow-md transition-shadow">
              <div className="aspect-square bg-sm-cream flex items-center justify-center overflow-hidden relative">
                <img src={m.url} alt={m.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button onClick={() => copyUrl(m.url, m.id)}
                    className="p-2 bg-white rounded-full text-sm-dark hover:bg-sm-cyan hover:text-white transition-colors"
                    title="Copier l'URL">
                    {copiedId === m.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button onClick={() => deleteMedia(m)}
                    className="p-2 bg-white rounded-full text-sm-dark hover:bg-red-500 hover:text-white transition-colors"
                    title="Supprimer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-3">
                <p className="text-xs font-medium text-sm-dark truncate" title={m.name}>{m.name}</p>
                <p className="text-[10px] text-sm-gray">{formatBytes(m.sizeBytes)} · {m.type} · {new Date(m.uploadedAt).toLocaleDateString("fr-FR")}</p>
              </div>
            </div>
          ))}
        </div>

        {!loading && filtered.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center border border-sm-lightgray">
            <ImageIcon className="w-12 h-12 text-sm-gray mx-auto mb-3" />
            <p className="text-sm-gray">Aucun média dans cette catégorie.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Save, Upload, ImageIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { SITE_IMAGE_SLOTS, resolveSiteImage, type SiteImagesMap } from "@/lib/site-images";

function slugify(text: string) {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function SiteImagesManager() {
  const [images, setImages] = useState<SiteImagesMap>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "site_config")
      .maybeSingle();

    const config = (data?.value as any) || {};
    setImages(config.siteImages || {});
    setLoading(false);
  };

  const updateAlt = (key: string, alt: string) => {
    setImages((prev) => ({ ...prev, [key]: { ...prev[key], alt, url: prev[key]?.url || "" } }));
  };

  const handleUpload = async (key: string, file: File) => {
    setUploadingKey(key);
    setError("");

    const customName = prompt(
      "Nom de fichier pour cette image (sans accents ni espaces, utile pour le SEO/GEO) :",
      slugify(file.name.replace(/\.[^/.]+$/, ""))
    );
    if (!customName) {
      setUploadingKey(null);
      return;
    }

    const ext = file.name.split(".").pop();
    const cleanName = slugify(customName);
    const path = `site-images/${cleanName}-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage.from("media").upload(path, file, {
      cacheControl: "31536000",
      upsert: false,
    });

    if (uploadError) {
      setError(`Erreur d'upload : ${uploadError.message}`);
      setUploadingKey(null);
      return;
    }

    const { data: publicUrlData } = supabase.storage.from("media").getPublicUrl(path);

    // Enregistre aussi une trace dans la médiathèque générale
    await supabase.from("media").insert({
      name: `${cleanName}.${ext}`,
      url: publicUrlData.publicUrl,
      type: "image",
      category: "site-images",
      size_bytes: file.size,
    });

    setImages((prev) => ({
      ...prev,
      [key]: { url: publicUrlData.publicUrl, alt: prev[key]?.alt || "" },
    }));
    setUploadingKey(null);
  };

  const saveAll = async () => {
    setSaving(true);
    setError("");

    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "site_config")
      .maybeSingle();
    const config = (data?.value as any) || {};

    const { error: upsertError } = await supabase.from("site_settings").upsert({
      key: "site_config",
      value: { ...config, siteImages: images },
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

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center border border-sm-lightgray text-sm-gray mb-8">
        Chargement des images du site...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-sm-lightgray p-6 mb-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-sm-dark text-lg">🖼️ Images clés du site</h2>
          <p className="text-xs text-sm-gray">Change ces photos et leur texte alternatif (important pour le SEO / référencement IA) sans toucher au code.</p>
        </div>
        <button
          onClick={saveAll}
          disabled={saving}
          className="flex items-center gap-2 bg-green-500 text-white font-semibold px-4 py-2.5 rounded-xl hover:bg-green-600 transition-colors disabled:opacity-60"
        >
          <Save className="w-4 h-4" /> {saving ? "Sauvegarde..." : "Sauvegarder"}
        </button>
      </div>

      {saved && (
        <p className="text-sm bg-green-50 text-green-700 rounded-xl p-3">✅ Images sauvegardées !</p>
      )}
      {error && (
        <p className="text-sm bg-red-50 text-red-700 rounded-xl p-3">⚠️ {error}</p>
      )}

      <div className="grid sm:grid-cols-2 gap-6">
        {SITE_IMAGE_SLOTS.map((slot) => {
          const resolved = resolveSiteImage(images, slot);
          return (
            <div key={slot.key} className="border border-sm-lightgray rounded-2xl p-4 space-y-3">
              <div className="aspect-video rounded-xl overflow-hidden bg-sm-cream relative">
                {resolved.url ? (
                  <img src={resolved.url} alt={resolved.alt} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm-gray">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                )}
              </div>
              <div>
                <p className="font-semibold text-sm-dark text-sm">{slot.label}</p>
                <p className="text-xs text-sm-gray">{slot.hint}</p>
              </div>

              <label className="flex items-center justify-center gap-2 border-2 border-dashed border-sm-lightgray rounded-xl py-2.5 text-sm text-sm-gray hover:border-sm-cyan hover:text-sm-cyan transition-colors cursor-pointer">
                <Upload className="w-4 h-4" />
                {uploadingKey === slot.key ? "Envoi..." : "Remplacer la photo"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploadingKey === slot.key}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUpload(slot.key, file);
                    e.target.value = "";
                  }}
                />
              </label>

              <div>
                <label className="block text-xs font-medium text-sm-dark mb-1">Texte alternatif (SEO / GEO)</label>
                <textarea
                  value={resolved.alt}
                  onChange={(e) => updateAlt(slot.key, e.target.value)}
                  rows={2}
                  placeholder={slot.defaultAlt}
                  className="w-full px-3 py-2 rounded-lg border border-sm-lightgray focus:border-sm-cyan outline-none text-xs resize-none"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

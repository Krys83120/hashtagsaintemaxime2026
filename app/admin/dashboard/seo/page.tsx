"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { motion } from "framer-motion";
import { Save, Globe, Truck, Tag } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface SiteConfig {
  siteTitle: string;
  siteDescription: string;
  keywords: string;
  ogImage: string;
  freeShippingThreshold: number;
  shippingCost: number;
  defaultCurrency: string;
  googleAnalyticsId: string;
  facebookPixelId: string;
  smartlookProjectKey: string;
  emailContact: string;
  instagramUrl: string;
  facebookUrl: string;
  tiktokUrl: string;
  tagembedWidgetId: string;
  googleReviewsWidgetCode: string;
  googleReviewsWidgetCode2: string;
  facebookWidgetCode: string;
  facebookFollowerCount: number;
  instagramFollowerCount: number;
  instagramHashtagCount: number;
  maintenanceMode: boolean;
}

const defaultConfig: SiteConfig = {
  siteTitle: "#SAINTEMAXIME® | Boutique Officielle & Souvenirs Sainte-Maxime Été 2026",
  siteDescription: "Découvre la marque officielle #SAINTEMAXIME : vêtements, accessoires et souvenirs uniques de Sainte-Maxime. Édition limitée été 2026.",
  keywords: "souvenirs sainte maxime, cadeau sainte maxime, boutique sainte maxime, t shirt sainte maxime, marque sainte maxime",
  ogImage: "/og-home-2026.jpg",
  freeShippingThreshold: 60,
  shippingCost: 4.90,
  defaultCurrency: "EUR",
  googleAnalyticsId: "",
  facebookPixelId: "",
  smartlookProjectKey: "",
  emailContact: "contact@hashtagsaintemaxime.fr",
  instagramUrl: "https://www.instagram.com/hashtag_saintemaxime/",
  facebookUrl: "https://www.facebook.com/hashtagsaintemaxime/",
  tiktokUrl: "https://www.tiktok.com/@hashtagsaintemaxime",
  tagembedWidgetId: "",
  googleReviewsWidgetCode: "",
  googleReviewsWidgetCode2: "",
  facebookWidgetCode: "",
  facebookFollowerCount: 0,
  instagramFollowerCount: 0,
  instagramHashtagCount: 218000,
  maintenanceMode: false,
};

export default function AdminSEOPage() {
  const [config, setConfig] = useState<SiteConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"seo" | "livraison" | "reseaux" |"general">("seo");
  const supabase = createClient();

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    const { data, error: loadError } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "site_config")
      .maybeSingle();

    if (loadError) {
      setError("Erreur de chargement : " + loadError.message);
    } else if (data) {
      setConfig({ ...defaultConfig, ...(data.value as Partial<SiteConfig>) });
    }
    setLoading(false);
  };

  const updateField = (field: keyof SiteConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const saveConfig = async () => {
    setSaving(true);
    setError("");

    const { error: upsertError } = await supabase
      .from("site_settings")
      .upsert({ key: "site_config", value: config, updated_at: new Date().toISOString() });

    setSaving(false);

    if (upsertError) {
      setError("Erreur de sauvegarde : " + upsertError.message);
      return;
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const tabs = [
    { id: "seo" as const, label: "SEO & Métas", icon: Tag },
    { id: "livraison" as const, label: "Livraison", icon: Truck },
    { id: "reseaux" as const, label: "Réseaux Sociaux", icon: Globe },
    { id: "general" as const, label: "Général", icon: Save },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-sm-dark">🔍 SEO & Configuration</h1>
            <p className="text-sm-gray">Paramètres du site, SEO, livraison et réseaux sociaux</p>
          </div>
          <button
            onClick={saveConfig}
            disabled={saving}
            className="flex items-center gap-2 bg-green-500 text-white font-semibold px-6 py-3 rounded-xl hover:bg-green-600 transition-colors disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            {saving ? "Sauvegarde..." : "Sauvegarder"}
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm font-medium">⚠️ {error}</div>
        )}

        {loading && (
          <div className="bg-white rounded-2xl p-12 text-center border border-sm-lightgray text-sm-gray">
            Chargement...
          </div>
        )}

        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-green-50 text-green-700 rounded-xl text-sm font-medium"
          >
            ✅ Configuration sauvegardée ! Rebuild le site pour appliquer les métas SEO.
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 border-b border-sm-lightgray pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-white text-sm-cyan border-t border-l border-r border-sm-lightgray"
                  : "text-sm-gray hover:text-sm-dark"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-sm-lightgray">
          {activeTab === "seo" && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-sm-dark mb-4">Méta-tags SEO</h2>
              <div>
                <label className="block text-sm font-medium text-sm-dark mb-1">Title (Page d'accueil)</label>
                <input
                  type="text"
                  value={config.siteTitle}
                  onChange={(e) => updateField("siteTitle", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-sm-lightgray focus:border-sm-cyan focus:ring-2 focus:ring-sm-cyan/20 outline-none text-sm"
                />
                <p className="text-xs text-sm-gray mt-1">{config.siteTitle.length} caractères (max 60 recommandé)</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-sm-dark mb-1">Meta Description</label>
                <textarea
                  value={config.siteDescription}
                  onChange={(e) => updateField("siteDescription", e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-sm-lightgray focus:border-sm-cyan focus:ring-2 focus:ring-sm-cyan/20 outline-none text-sm resize-none"
                />
                <p className="text-xs text-sm-gray mt-1">{config.siteDescription.length} caractères (max 160 recommandé)</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-sm-dark mb-1">Mots-clés (séparés par virgules)</label>
                <textarea
                  value={config.keywords}
                  onChange={(e) => updateField("keywords", e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-sm-lightgray focus:border-sm-cyan focus:ring-2 focus:ring-sm-cyan/20 outline-none text-sm resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-sm-dark mb-1">Image Open Graph (URL)</label>
                <input
                  type="text"
                  value={config.ogImage}
                  onChange={(e) => updateField("ogImage", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-sm-lightgray focus:border-sm-cyan focus:ring-2 focus:ring-sm-cyan/20 outline-none text-sm"
                />
                <p className="text-xs text-sm-gray mt-1">Dimensions recommandées : 1200 x 630px</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-sm-dark mb-1">Google Analytics ID</label>
                <input
                  type="text"
                  value={config.googleAnalyticsId}
                  onChange={(e) => updateField("googleAnalyticsId", e.target.value)}
                  placeholder="G-XXXXXXXXXX"
                  className="w-full px-4 py-3 rounded-xl border border-sm-lightgray focus:border-sm-cyan focus:ring-2 focus:ring-sm-cyan/20 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-sm-dark mb-1">Facebook Pixel ID</label>
                <input
                  type="text"
                  value={config.facebookPixelId}
                  onChange={(e) => updateField("facebookPixelId", e.target.value)}
                  placeholder="XXXXXXXXXX"
                  className="w-full px-4 py-3 rounded-xl border border-sm-lightgray focus:border-sm-cyan focus:ring-2 focus:ring-sm-cyan/20 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-sm-dark mb-1">Smartlook Project Key</label>
                <input
                  type="text"
                  value={config.smartlookProjectKey}
                  onChange={(e) => updateField("smartlookProjectKey", e.target.value)}
                  placeholder="ex: a1b2c3d4e5f6..."
                  className="w-full px-4 py-3 rounded-xl border border-sm-lightgray focus:border-sm-cyan focus:ring-2 focus:ring-sm-cyan/20 outline-none text-sm font-mono"
                />
                <p className="text-xs text-sm-gray mt-1">
                  Sur smartlook.com → Settings → Tracking code, copie la clé de projet.
                </p>
              </div>
            </div>
          )}

          {activeTab === "livraison" && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-sm-dark mb-4">Paramètres de livraison</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-sm-dark mb-1">Livraison offerte dès (€)</label>
                  <input
                    type="number"
                    value={config.freeShippingThreshold}
                    onChange={(e) => updateField("freeShippingThreshold", parseFloat(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border border-sm-lightgray focus:border-sm-cyan focus:ring-2 focus:ring-sm-cyan/20 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-sm-dark mb-1">Frais de port standard (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={config.shippingCost}
                    onChange={(e) => updateField("shippingCost", parseFloat(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border border-sm-lightgray focus:border-sm-cyan focus:ring-2 focus:ring-sm-cyan/20 outline-none text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-sm-dark mb-1">Devise</label>
                <select
                  value={config.defaultCurrency}
                  onChange={(e) => updateField("defaultCurrency", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-sm-lightgray focus:border-sm-cyan focus:ring-2 focus:ring-sm-cyan/20 outline-none text-sm"
                >
                  <option value="EUR">EUR (€)</option>
                  <option value="USD">USD ($)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === "reseaux" && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-sm-dark mb-4">Réseaux Sociaux</h2>
              <div>
                <label className="block text-sm font-medium text-sm-dark mb-1">Email de contact</label>
                <input
                  type="email"
                  value={config.emailContact}
                  onChange={(e) => updateField("emailContact", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-sm-lightgray focus:border-sm-cyan focus:ring-2 focus:ring-sm-cyan/20 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-sm-dark mb-1">Instagram URL</label>
                <input
                  type="url"
                  value={config.instagramUrl}
                  onChange={(e) => updateField("instagramUrl", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-sm-lightgray focus:border-sm-cyan focus:ring-2 focus:ring-sm-cyan/20 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-sm-dark mb-1">Facebook URL</label>
                <input
                  type="url"
                  value={config.facebookUrl}
                  onChange={(e) => updateField("facebookUrl", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-sm-lightgray focus:border-sm-cyan focus:ring-2 focus:ring-sm-cyan/20 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-sm-dark mb-1">TikTok URL</label>
                <input
                  type="url"
                  value={config.tiktokUrl}
                  onChange={(e) => updateField("tiktokUrl", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-sm-lightgray focus:border-sm-cyan focus:ring-2 focus:ring-sm-cyan/20 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-sm-dark mb-1">Tagembed Widget ID (flux Instagram "Cœur au Sol")</label>
                <input
                  type="text"
                  value={config.tagembedWidgetId}
                  onChange={(e) => updateField("tagembedWidgetId", e.target.value)}
                  placeholder="ex: 123456"
                  className="w-full px-4 py-3 rounded-xl border border-sm-lightgray focus:border-sm-cyan focus:ring-2 focus:ring-sm-cyan/20 outline-none text-sm"
                />
                <p className="text-xs text-sm-gray mt-1">
                  Récupère cet ID depuis ton tableau de bord sur tagembed.com (widget de type "Instagram Hashtag" configuré sur #SAINTEMAXIME).
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-sm-dark mb-1">Trustindex — Code widget (avis Google, page d'accueil)</label>
                <input
                  type="text"
                  value={config.googleReviewsWidgetCode}
                  onChange={(e) => updateField("googleReviewsWidgetCode", e.target.value)}
                  placeholder="ex: 111fa111950c622dern267v531"
                  className="w-full px-4 py-3 rounded-xl border border-sm-lightgray focus:border-sm-cyan focus:ring-2 focus:ring-sm-cyan/20 outline-none text-sm font-mono"
                />
                <p className="text-xs text-sm-gray mt-1">
                  Sur trustindex.io, crée un widget "Google Reviews", récupère le code d'intégration
                  (<code className="bg-sm-cream px-1 rounded">loader.js?CE_CODE</code>) et colle uniquement la partie après le "?".
                </p>
              </div>
			  <div>
                <label className="block text-sm font-medium text-sm-dark mb-1">Trustindex — Code widget (avis Google, 2ème fiche : "Le Hashtag Géant")</label>
                <input
                  type="text"
                  value={config.googleReviewsWidgetCode2}
                  onChange={(e) => updateField("googleReviewsWidgetCode2", e.target.value)}
                  placeholder="ex: 333fc333172844fptn489x753"
                  className="w-full px-4 py-3 rounded-xl border border-sm-lightgray focus:border-sm-cyan focus:ring-2 focus:ring-sm-cyan/20 outline-none text-sm font-mono"
                />
                <p className="text-xs text-sm-gray mt-1">
                  Même principe, mais avec un widget connecté à ta 2ème fiche Google Business (celle du hashtag géant).
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-sm-dark mb-1">Trustindex — Code widget (avis Facebook, page d'accueil)</label>
                <input
                  type="text"
                  value={config.facebookWidgetCode}
                  onChange={(e) => updateField("facebookWidgetCode", e.target.value)}
                  placeholder="ex: 222fb222061733eosn378w642"
                  className="w-full px-4 py-3 rounded-xl border border-sm-lightgray focus:border-sm-cyan focus:ring-2 focus:ring-sm-cyan/20 outline-none text-sm font-mono"
                />
                <p className="text-xs text-sm-gray mt-1">
                  Même principe avec un widget "Facebook Reviews" connecté à facebook.com/HashtagSainteMaxime.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-sm-lightgray">
                <div>
                  <label className="block text-sm font-medium text-sm-dark mb-1">Nombre d'abonnés Facebook (affiché sur l'accueil)</label>
                  <input
                    type="number"
                    value={config.facebookFollowerCount}
                    onChange={(e) => updateField("facebookFollowerCount", Number(e.target.value))}
                    placeholder="ex: 1957"
                    className="w-full px-4 py-3 rounded-xl border border-sm-lightgray focus:border-sm-cyan focus:ring-2 focus:ring-sm-cyan/20 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-sm-dark mb-1">Nombre d'abonnés Instagram (affiché sur l'accueil)</label>
                  <input
                    type="number"
                    value={config.instagramFollowerCount}
                    onChange={(e) => updateField("instagramFollowerCount", Number(e.target.value))}
                    placeholder="ex: 255"
                    className="w-full px-4 py-3 rounded-xl border border-sm-lightgray focus:border-sm-cyan focus:ring-2 focus:ring-sm-cyan/20 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-sm-dark mb-1">Nombre de photos/vidéos #SAINTEMAXIME sur Instagram</label>
                  <input
                    type="number"
                    value={config.instagramHashtagCount}
                    onChange={(e) => updateField("instagramHashtagCount", Number(e.target.value))}
                    placeholder="ex: 218000"
                    className="w-full px-4 py-3 rounded-xl border border-sm-lightgray focus:border-sm-cyan focus:ring-2 focus:ring-sm-cyan/20 outline-none text-sm"
                  />
                  <p className="text-xs text-sm-gray mt-1">
                    Instagram ne fournit pas ce chiffre par API — va vérifier toi-même sur Instagram (recherche #saintemaxime) et mets-le à jour ici de temps en temps.
                  </p>
                </div>
              </div>
              <p className="text-xs text-sm-gray -mt-2">
                Laisse à 0 pour ne pas afficher ce compteur. Comme les réseaux ne donnent pas facilement ce chiffre en temps réel, mets-le à jour manuellement de temps en temps.
              </p>
            </div>
          )}

          {activeTab === "general" && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-sm-dark mb-4">Paramètres généraux</h2>
              <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                <input
                  type="checkbox"
                  id="maintenance"
                  checked={config.maintenanceMode}
                  onChange={(e) => updateField("maintenanceMode", e.target.checked)}
                  className="w-5 h-5 accent-sm-cyan"
                />
                <label htmlFor="maintenance" className="text-sm text-yellow-800 font-medium">
                  Mode maintenance (afficher une page de maintenance aux visiteurs)
                </label>
              </div>
              <div className="p-4 bg-sm-cream rounded-xl">
                <p className="text-sm text-sm-dark font-medium mb-2">📁 Fichiers à modifier manuellement :</p>
                <ul className="text-sm text-sm-gray space-y-1 list-disc list-inside">
                  <li><code className="bg-white px-1 rounded">lib/products.ts</code> pour les produits</li>
                  <li><code className="bg-white px-1 rounded">app/layout.tsx</code> pour les métas SEO globales</li>
                  <li><code className="bg-white px-1 rounded">next.config.js</code> pour le domaine</li>
                  <li><code className="bg-white px-1 rounded">tailwind.config.ts</code> pour les couleurs</li>
                </ul>
              </div>
              <div className="p-4 bg-sm-cyan/5 rounded-xl">
                <p className="text-sm text-sm-dark font-medium mb-2">🚀 Prochaines étapes recommandées :</p>
                <ol className="text-sm text-sm-gray space-y-1 list-decimal list-inside">
                  <li>Connecter le domaine sur Vercel</li>
                  <li>Configurer Google Analytics</li>
                  <li>Soumettre le sitemap à Google Search Console</li>
                  <li>Tester une commande complète</li>
                  <li>Lancer la campagne Meta Ads</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
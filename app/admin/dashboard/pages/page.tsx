"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { motion } from "framer-motion";
import { Save, Home, Store, Heart, Info, Truck, FileText, Eye } from "lucide-react";

interface PageContent {
  title: string;
  subtitle: string;
  heroImage: string;
  heroButtonText: string;
  heroButtonLink: string;
  sections: { id: string; title: string; content: string; active: boolean }[];
}

interface HomeContent {
  bannerText: string;
  bannerActive: boolean;
  heroTitle: string;
  heroSubtitle: string;
  heroButtonText: string;
  featuredSectionTitle: string;
  featuredProductIds: string[];
  aboutSnippet: string;
  newsletterTitle: string;
  newsletterText: string;
}

const defaultHome: HomeContent = {
  bannerText: "🌴 C'est l'été ! Livraison offerte dès 60€ dans le Var — Code : ETE2026",
  bannerActive: true,
  heroTitle: "La Marque Officielle de Sainte-Maxime",
  heroSubtitle: "Vêtements, accessoires & souvenirs uniques estampillés #SAINTEMAXIME. Édition été 2026.",
  heroButtonText: "Découvrir la Collection",
  featuredSectionTitle: "Nos Best-sellers",
  featuredProductIds: ["1", "2", "4", "5"],
  aboutSnippet: "#SAINTEMAXIME n'est pas qu'une boutique. C'est un lifestyle. C'est un état d'esprit. C'est Sainte-Maxime qu'on emporte partout.",
  newsletterTitle: "Rejoins la #SAINTEMAXIME Family",
  newsletterText: "10% de bienvenue + accès aux ventes privées",
};

const pageDefaults: Record<string, PageContent> = {
  boutique: {
    title: "Boutique #SAINTEMAXIME",
    subtitle: "Tous nos produits officiels",
    heroImage: "/images/hero-boutique.jpg",
    heroButtonText: "",
    heroButtonLink: "",
    sections: [
      { id: "categories", title: "Nos Catégories", content: "", active: true },
      { id: "filters", title: "Filtres produits", content: "", active: true },
      { id: "newsletter", title: "Newsletter", content: "", active: true },
    ],
  },
  "la-marque": {
    title: "La Marque #SAINTEMAXIME",
    subtitle: "L'histoire, la ville, le lifestyle",
    heroImage: "/images/hero-marque.jpg",
    heroButtonText: "Découvrir la boutique",
    heroButtonLink: "/boutique/",
    sections: [
      { id: "story", title: "Notre Histoire", content: "Fondée en 2019, #SAINTEMAXIME est la marque officielle de la ville de Sainte-Maxime...", active: true },
      { id: "values", title: "Nos Valeurs", content: "Qualité, authenticité, passion pour la Côte d'Azur...", active: true },
      { id: "team", title: "L'Équipe", content: "", active: false },
    ],
  },
  "le-coeur-au-sol": {
    title: "Le Cœur au Sol",
    subtitle: "Trouve le Cœur ❤️ Partage ton #SAINTEMAXIME",
    heroImage: "/images/hero-coeur.jpg",
    heroButtonText: "Télécharger le cadre Instagram",
    heroButtonLink: "#",
    sections: [
      { id: "map", title: "Carte du Cœur", content: "Le cœur #SAINTEMAXIME est situé sur la promenade de Sainte-Maxime...", active: true },
      { id: "gallery", title: "Galerie UGC", content: "", active: true },
      { id: "challenge", title: "Le Challenge", content: "Poste ta photo avec le cœur + hashtag #SAINTEMAXIME...", active: true },
    ],
  },
};

export default function AdminPagesPage() {
  const [activeTab, setActiveTab] = useState<"home" | string>("home");
  const [homeContent, setHomeContent] = useState<HomeContent>(defaultHome);
  const [pageContents, setPageContents] = useState<Record<string, PageContent>>(pageDefaults);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedHome = localStorage.getItem("sm_admin_home");
    if (savedHome) setHomeContent({ ...defaultHome, ...JSON.parse(savedHome) });
    const savedPages = localStorage.getItem("sm_admin_pages");
    if (savedPages) setPageContents({ ...pageDefaults, ...JSON.parse(savedPages) });
  }, []);

  const save = () => {
    localStorage.setItem("sm_admin_home", JSON.stringify(homeContent));
    localStorage.setItem("sm_admin_pages", JSON.stringify(pageContents));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const updateHome = (field: keyof HomeContent, value: any) => {
    setHomeContent((prev) => ({ ...prev, [field]: value }));
  };

  const updatePage = (page: string, field: keyof PageContent, value: any) => {
    setPageContents((prev) => ({
      ...prev,
      [page]: { ...prev[page], [field]: value },
    }));
  };

  const updatePageSection = (page: string, sectionId: string, field: keyof PageContent["sections"][0], value: any) => {
    setPageContents((prev) => ({
      ...prev,
      [page]: {
        ...prev[page],
        sections: prev[page].sections.map((s) => (s.id === sectionId ? { ...s, [field]: value } : s)),
      },
    }));
  };

  const tabs = [
    { id: "home", label: "🏠 Accueil", icon: Home },
    { id: "boutique", label: "🛒 Boutique", icon: Store },
    { id: "la-marque", label: "🏷️ La Marque", icon: Info },
    { id: "le-coeur-au-sol", label: "❤️ Le Cœur", icon: Heart },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-sm-dark">📄 Pages & Accueil</h1>
            <p className="text-sm-gray">Personnalise le contenu de chaque page du site</p>
          </div>
          <button onClick={save}
            className="flex items-center gap-2 bg-green-500 text-white font-semibold px-6 py-3 rounded-xl hover:bg-green-600 transition-colors">
            <Save className="w-4 h-4" /> Sauvegarder
          </button>
        </div>

        {saved && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-green-50 text-green-700 rounded-xl text-sm font-medium">
            ✅ Contenu sauvegardé !
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 border-b border-sm-lightgray pb-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id ? "bg-white text-sm-cyan border-t border-l border-r border-sm-lightgray" : "text-sm-gray hover:text-sm-dark"
              }`}>
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        {/* Home content */}
        {activeTab === "home" && (
          <div className="bg-white rounded-2xl p-6 border border-sm-lightgray space-y-6">
            <h2 className="text-lg font-bold text-sm-dark">🏠 Page d'accueil</h2>

            {/* Banner */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <input type="checkbox" id="bannerActive" checked={homeContent.bannerActive}
                  onChange={(e) => updateHome("bannerActive", e.target.checked)}
                  className="w-5 h-5 accent-sm-cyan" />
                <label htmlFor="bannerActive" className="text-sm font-medium text-sm-dark">Afficher la bannière top</label>
              </div>
              <input type="text" value={homeContent.bannerText}
                onChange={(e) => updateHome("bannerText", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-sm-lightgray focus:border-sm-cyan outline-none text-sm"
                placeholder="Texte de la bannière..." />
            </div>

            {/* Hero */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm-dark">Section Hero</h3>
              <input type="text" value={homeContent.heroTitle}
                onChange={(e) => updateHome("heroTitle", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-sm-lightgray focus:border-sm-cyan outline-none text-sm font-semibold"
                placeholder="Titre principal" />
              <textarea value={homeContent.heroSubtitle} rows={2}
                onChange={(e) => updateHome("heroSubtitle", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-sm-lightgray focus:border-sm-cyan outline-none text-sm resize-none"
                placeholder="Sous-titre" />
              <div className="grid sm:grid-cols-2 gap-4">
                <input type="text" value={homeContent.heroButtonText}
                  onChange={(e) => updateHome("heroButtonText", e.target.value)}
                  className="px-4 py-3 rounded-xl border border-sm-lightgray focus:border-sm-cyan outline-none text-sm"
                  placeholder="Texte du bouton" />
              </div>
            </div>

            {/* Featured */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm-dark">Produits mis en avant</h3>
              <input type="text" value={homeContent.featuredSectionTitle}
                onChange={(e) => updateHome("featuredSectionTitle", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-sm-lightgray focus:border-sm-cyan outline-none text-sm"
                placeholder="Titre de la section" />
              <p className="text-xs text-sm-gray">Les produits en avant sont définis dans la page Produits (badge BESTSELLER)</p>
            </div>

            {/* About snippet */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm-dark">Citation / Accroche</h3>
              <textarea value={homeContent.aboutSnippet} rows={3}
                onChange={(e) => updateHome("aboutSnippet", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-sm-lightgray focus:border-sm-cyan outline-none text-sm resize-none" />
            </div>

            {/* Newsletter */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm-dark">Section Newsletter</h3>
              <input type="text" value={homeContent.newsletterTitle}
                onChange={(e) => updateHome("newsletterTitle", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-sm-lightgray focus:border-sm-cyan outline-none text-sm"
                placeholder="Titre newsletter" />
              <input type="text" value={homeContent.newsletterText}
                onChange={(e) => updateHome("newsletterText", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-sm-lightgray focus:border-sm-cyan outline-none text-sm"
                placeholder="Texte d'incitation" />
            </div>
          </div>
        )}

        {/* Other pages */}
        {activeTab !== "home" && pageContents[activeTab] && (
          <div className="bg-white rounded-2xl p-6 border border-sm-lightgray space-y-6">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-sm-dark">{tabs.find((t) => t.id === activeTab)?.label}</h2>
              <a href={`/${activeTab}/`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-sm-cyan hover:underline">
                <Eye className="w-3 h-3" /> Voir la page
              </a>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-sm-gray mb-1">Titre de la page</label>
                <input type="text" value={pageContents[activeTab].title}
                  onChange={(e) => updatePage(activeTab, "title", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-sm-lightgray focus:border-sm-cyan outline-none text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-sm-gray mb-1">Sous-titre</label>
                <input type="text" value={pageContents[activeTab].subtitle}
                  onChange={(e) => updatePage(activeTab, "subtitle", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-sm-lightgray focus:border-sm-cyan outline-none text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-sm-gray mb-1">Image Hero (URL)</label>
              <input type="text" value={pageContents[activeTab].heroImage}
                onChange={(e) => updatePage(activeTab, "heroImage", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-sm-lightgray focus:border-sm-cyan outline-none text-sm"
                placeholder="/images/hero-xxx.jpg" />
            </div>

            {/* Sections */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm-dark">Sections de la page</h3>
              {pageContents[activeTab].sections.map((section) => (
                <div key={section.id} className="border border-sm-lightgray rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input type="checkbox" checked={section.active}
                        onChange={(e) => updatePageSection(activeTab, section.id, "active", e.target.checked)}
                        className="w-5 h-5 accent-sm-cyan" />
                      <span className="font-medium text-sm-dark">{section.title}</span>
                    </div>
                  </div>
                  <textarea value={section.content} rows={3}
                    onChange={(e) => updatePageSection(activeTab, section.id, "content", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-sm-lightgray focus:border-sm-cyan outline-none text-sm resize-none"
                    placeholder="Contenu de la section..." />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

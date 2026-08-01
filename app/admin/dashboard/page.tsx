"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { motion } from "framer-motion";
import { ShoppingBag, Users, TrendingUp, DollarSign, Package, Eye } from "lucide-react";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalProducts: 8,
    totalViews: 1247,
    subscribers: 0,
    revenue: 0,
  });

  useEffect(() => {
    const saved = localStorage.getItem("sm_admin_stats");
    if (saved) setStats(JSON.parse(saved));
  }, []);

  const cards = [
    { label: "Produits", value: stats.totalProducts, icon: Package, color: "bg-sm-cyan" },
    { label: "Vues du site", value: stats.totalViews, icon: Eye, color: "bg-sm-deep" },
    { label: "Inscrits newsletter", value: stats.subscribers, icon: Users, color: "bg-sm-coral" },
    { label: "Revenus estimés", value: `${stats.revenue}€`, icon: DollarSign, color: "bg-green-500" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-sm-dark">Dashboard</h1>
          <p className="text-sm-gray">Vue d'ensemble de ta boutique #SAINTEMAXIME</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-sm-lightgray"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center text-white`}>
                  <card.icon className="w-6 h-6" />
                </div>
              </div>
              <p className="text-3xl font-bold text-sm-dark">{card.value}</p>
              <p className="text-sm text-sm-gray">{card.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-sm-lightgray">
            <h2 className="text-lg font-bold text-sm-dark mb-4">🚀 Actions rapides</h2>
            <div className="space-y-3">
              <a href="/admin/dashboard/printful" className="block p-4 bg-sm-cyan/5 rounded-xl hover:bg-sm-cyan/10 transition-colors">
                <p className="font-semibold text-sm-cyan">🖨️ Synchroniser Printful</p>
                <p className="text-sm text-sm-gray">Importer / mettre à jour tes produits Printful</p>
              </a>
              <a href="/admin/dashboard/produits" className="block p-4 bg-sm-coral/5 rounded-xl hover:bg-sm-coral/10 transition-colors">
                <p className="font-semibold text-sm-coral">📦 Gérer les produits</p>
                <p className="text-sm text-sm-gray">Prix, descriptions, stock, images</p>
              </a>
              <a href="/admin/dashboard/seo" className="block p-4 bg-sm-deep/5 rounded-xl hover:bg-sm-deep/10 transition-colors">
                <p className="font-semibold text-sm-deep">🔍 SEO & Configuration</p>
                <p className="text-sm text-sm-gray">Méta-tags, livraison, paramètres généraux</p>
              </a>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-sm-lightgray">
            <h2 className="text-lg font-bold text-sm-dark mb-4">📋 Checklist lancement</h2>
            <div className="space-y-2">
              {[
                { label: "Configurer la clé API Printful", done: false },
                { label: "Synchroniser les produits", done: false },
                { label: "Vérifier les prix et marges", done: false },
                { label: "Configurer les frais de livraison", done: false },
                { label: "Tester une commande", done: false },
                { label: "Connecter le domaine (Vercel)", done: false },
                { label: "Activer Google Analytics", done: false },
                { label: "Soumettre le sitemap Google", done: false },
              ].map((item, i) => (
                <label key={i} className="flex items-center gap-3 cursor-pointer hover:bg-sm-cream p-2 rounded-lg transition-colors">
                  <input type="checkbox" defaultChecked={item.done} className="w-5 h-5 accent-sm-cyan rounded" />
                  <span className={`text-sm ${item.done ? "text-sm-gray line-through" : "text-sm-dark"}`}>{item.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

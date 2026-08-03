"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { motion } from "framer-motion";
import { Users, DollarSign, Package, Eye } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalViews: 0,
    subscribers: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);

    const [{ count: totalProducts }, { data: viewsData }, { count: subscribers }, { data: ordersData }] =
      await Promise.all([
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("products").select("view_count"),
        supabase.from("newsletter_subscribers").select("*", { count: "exact", head: true }).eq("active", true),
        supabase.from("orders").select("total, status").in("status", ["paid", "processing", "shipped", "delivered"]),
      ]);

    const totalViews = (viewsData || []).reduce((sum, p: any) => sum + (p.view_count || 0), 0);
    const revenue = (ordersData || []).reduce((sum, o: any) => sum + Number(o.total || 0), 0);

    setStats({
      totalProducts: totalProducts || 0,
      totalViews,
      subscribers: subscribers || 0,
      revenue: Math.round(revenue * 100) / 100,
    });
    setLoading(false);
  };

  const cards = [
    { label: "Produits", value: stats.totalProducts, icon: Package, color: "bg-sm-cyan" },
    { label: "Vues des fiches produits", value: stats.totalViews, icon: Eye, color: "bg-sm-deep" },
    { label: "Inscrits newsletter", value: stats.subscribers, icon: Users, color: "bg-sm-coral" },
    { label: "Revenus (commandes payées)", value: `${stats.revenue.toFixed(2)}€`, icon: DollarSign, color: "bg-green-500" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-sm-dark">Dashboard</h1>
          <p className="text-sm-gray">Vue d'ensemble de ta boutique #SAINTEMAXIME</p>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-sm-lightgray text-sm-gray">
            Chargement des statistiques...
          </div>
        ) : (
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
        )}

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
                "Configurer la clé API Printful",
                "Synchroniser les produits",
                "Vérifier les prix et marges",
                "Configurer les frais de livraison",
                "Tester une commande",
                "Connecter le domaine (Vercel)",
                "Activer Google Analytics",
                "Soumettre le sitemap Google",
              ].map((label, i) => (
                <label key={i} className="flex items-center gap-3 cursor-pointer hover:bg-sm-cream p-2 rounded-lg transition-colors">
                  <input type="checkbox" className="w-5 h-5 accent-sm-cyan rounded" />
                  <span className="text-sm text-sm-dark">{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

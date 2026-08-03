"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, Printer, Package, Tags, Users, ShoppingCart,
  FileText, ImageIcon, Link2, Settings, LogOut, ChevronLeft, Menu, X, Tag, Gift, Mail
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // L'accès à /admin/dashboard/* est déjà protégé côté serveur par middleware.ts
  // (redirection automatique vers /admin/ si non connecté).

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/");
    router.refresh();
  };

  const navGroups = [
    {
      label: "Boutique",
      items: [
        { href: "/admin/dashboard/", label: "Dashboard", icon: LayoutDashboard },
        { href: "/admin/dashboard/printful", label: "Printful", icon: Printer },
        { href: "/admin/dashboard/produits", label: "Produits", icon: Package },
        { href: "/admin/dashboard/categories", label: "Catégories", icon: Tags },
        { href: "/admin/dashboard/commandes", label: "Commandes", icon: ShoppingCart },
        { href: "/admin/dashboard/promos", label: "Codes promo", icon: Tag },
        { href: "/admin/dashboard/roue", label: "Roue de la Fortune", icon: Gift },
        { href: "/admin/dashboard/newsletter", label: "Newsletter", icon: Mail },
      ],
    },
    {
      label: "Contenu",
      items: [
        { href: "/admin/dashboard/pages", label: "Pages & Accueil", icon: FileText },
        { href: "/admin/dashboard/medias", label: "Médias & Logos", icon: ImageIcon },
        { href: "/admin/dashboard/seo", label: "SEO & Config", icon: Settings },
        { href: "/admin/dashboard/liens", label: "Liens & Réseaux", icon: Link2 },
      ],
    },
    {
      label: "Gestion",
      items: [
        { href: "/admin/dashboard/utilisateurs", label: "Utilisateurs", icon: Users },
      ],
    },
  ];

  const isActive = (href: string) => {
    if (href === "/admin/dashboard/") return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-sm-cream flex">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-sm-lightgray flex flex-col transform transition-transform duration-200 lg:transform-none ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="p-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1">
            <span className="text-2xl font-bold text-sm-cyan">#</span>
            <span className="text-lg font-bold text-sm-cyan">SAINTEMAXIME</span>
            <span className="font-script italic text-sm text-sm-coral ml-1">admin</span>
          </Link>
          <button onClick={() => setMobileOpen(false)} className="lg:hidden p-1">
            <X className="w-5 h-5 text-sm-gray" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 space-y-6">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="px-3 text-[11px] font-bold text-sm-gray uppercase tracking-wider mb-1">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                        active
                          ? "bg-sm-cyan/10 text-sm-cyan"
                          : "text-sm-dark hover:bg-sm-cyan/5 hover:text-sm-cyan"
                      }`}
                    >
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sm-lightgray space-y-2">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 text-sm text-sm-cyan hover:bg-sm-cyan/5 rounded-xl transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Voir le site
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-sm-coral hover:bg-sm-coral/5 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 overflow-auto">
        {/* Mobile header */}
        <div className="lg:hidden sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-sm-lightgray px-4 py-3 flex items-center justify-between">
          <button onClick={() => setMobileOpen(true)}>
            <Menu className="w-6 h-6 text-sm-dark" />
          </button>
          <span className="font-bold text-sm-cyan">#SAINTEMAXIME Admin</span>
          <div className="w-6" />
        </div>
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

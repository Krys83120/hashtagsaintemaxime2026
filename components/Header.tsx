"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, Heart, Menu, X, Search, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/lib/store/cart";
import { useWishlistStore } from "@/lib/store/wishlist";
import CartDrawer from "@/components/CartDrawer";
import SearchModal from "@/components/SearchModal";

import type { SiteLink } from "@/lib/links-types";
import { linksBySection } from "@/lib/links-types";

interface HeaderProps {
  links?: SiteLink[];
}

export default function Header({ links = [] }: HeaderProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const cartCount = useCartStore((state) => state.items.reduce((sum, i) => sum + i.quantity, 0));
  const wishlistCount = useWishlistStore((state) => state.items.length);

  // Garde-fou : ferme le panier/la recherche/le menu à chaque changement de page,
  // quelle que soit la façon dont on y arrive (clic, retour navigateur, etc.)
  useEffect(() => {
    setCartOpen(false);
    setSearchOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  const dynamicHeaderLinks = linksBySection(links, "header");
  const navLinks = dynamicHeaderLinks.length > 0
    ? dynamicHeaderLinks.map((l) => ({ href: l.url, label: l.label }))
    : [
        { href: "/boutique/", label: "Boutique" },
        { href: "/boutique/", label: "Accessoires" },
        { href: "/boutique/", label: "Vêtements" },
        { href: "/le-coeur-au-sol/", label: "Le Cœur au Sol" },
        { href: "/la-marque/", label: "La Marque" },
      ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-glass border-b border-sm-lightgray/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1 group">
            <span className="text-4xl font-bold text-sm-cyan leading-none">#</span>
            <span className="text-2xl font-bold tracking-tight text-sm-cyan leading-none">
              SAINTEMAXIME
            </span>
            <span className="font-script italic text-xl text-sm-coral ml-1 leading-none">
              lifestyle
            </span>
            <span className="text-sm-coral animate-heartbeat text-xl ml-0.5">❤</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm-dark font-medium text-sm hover:text-sm-cyan transition-colors relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-sm-cyan transition-all group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button onClick={() => setSearchOpen(true)} className="p-2 hover:bg-sm-cream rounded-full transition-colors">
              <Search className="w-5 h-5 text-sm-dark" />
            </button>
            <Link href="/compte/" className="p-2 hover:bg-sm-cream rounded-full transition-colors">
              <User className="w-5 h-5 text-sm-dark" />
            </Link>
            <Link href="/wishlist/" className="p-2 hover:bg-sm-cream rounded-full transition-colors relative">
              <Heart className="w-5 h-5 text-sm-dark" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-sm-coral text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <button onClick={() => setCartOpen(true)} className="p-2 hover:bg-sm-cream rounded-full transition-colors relative">
              <ShoppingCart className="w-5 h-5 text-sm-dark" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-sm-coral text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile toggle */}
            <button
              className="md:hidden p-2 hover:bg-sm-cream rounded-full transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-white border-t border-sm-lightgray overflow-hidden"
          >
            <div className="px-4 py-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="block text-lg font-medium text-sm-dark hover:text-sm-cyan transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
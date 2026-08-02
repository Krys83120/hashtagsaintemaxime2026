"use client";

import Link from "next/link";
import { Instagram, Facebook, Twitter } from "lucide-react";
import type { SiteLink } from "@/lib/links-types";
import { linksBySection } from "@/lib/links-types";

interface FooterProps {
  links?: SiteLink[];
}

export default function Footer({ links = [] }: FooterProps) {
  const socialLinks = linksBySection(links, "social");
  const footerLinks = linksBySection(links, "footer");
  const legalLinks = linksBySection(links, "legal");

  const instagramUrl = socialLinks.find((l) => l.label.toLowerCase().includes("instagram"))?.url || "https://www.instagram.com/hashtag_saintemaxime/";
  const facebookUrl = socialLinks.find((l) => l.label.toLowerCase().includes("facebook"))?.url || "https://facebook.com/hashtagsaintemaxime";
  const tiktokUrl = socialLinks.find((l) => l.label.toLowerCase().includes("tiktok"))?.url || "https://tiktok.com/@hashtagsaintemaxime";
  return (
    <footer className="bg-white border-t border-sm-lightgray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-1">
              <span className="text-4xl font-bold text-sm-cyan leading-none">#</span>
              <span className="text-2xl font-bold tracking-tight text-sm-cyan leading-none">
                SAINTEMAXIME
              </span>
              <span className="font-script italic text-xl text-sm-coral ml-1 leading-none">
                lifestyle
              </span>
              <span className="text-sm-coral text-xl ml-0.5">❤</span>
            </Link>
            <p className="text-sm-gray text-sm leading-relaxed">
              La marque officielle déposée depuis 2019. Vêtements, accessoires & souvenirs uniques de Sainte-Maxime.
            </p>
            <div className="flex gap-4 pt-2">
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-sm-cream rounded-full hover:bg-sm-cyan hover:text-white transition-all">
                <Instagram className="w-5 h-5" />
              </a>
              <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-sm-cream rounded-full hover:bg-sm-cyan hover:text-white transition-all">
                <Facebook className="w-5 h-5" />
              </a>
              <a href={tiktokUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-sm-cream rounded-full hover:bg-sm-cyan hover:text-white transition-all">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold text-sm-dark mb-4">Boutique</h4>
            <ul className="space-y-2 text-sm text-sm-gray">
              <li><Link href="/boutique/" className="hover:text-sm-cyan transition-colors">Tous les produits</Link></li>
              <li><Link href="/boutique/" className="hover:text-sm-cyan transition-colors">Accessoires</Link></li>
              <li><Link href="/boutique/" className="hover:text-sm-cyan transition-colors">Vêtements</Link></li>
              <li><Link href="/boutique/" className="hover:text-sm-cyan transition-colors">Vie Quotidienne</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm-dark mb-4">La Marque</h4>
            <ul className="space-y-2 text-sm text-sm-gray">
              <li><Link href="/la-marque/" className="hover:text-sm-cyan transition-colors">Notre histoire</Link></li>
              <li><Link href="/le-coeur-au-sol/" className="hover:text-sm-cyan transition-colors">Le Cœur au Sol</Link></li>
              <li><Link href="/la-marque/" className="hover:text-sm-cyan transition-colors">Partenariats</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm-dark mb-4">Aide</h4>
            <ul className="space-y-2 text-sm text-sm-gray">
              {footerLinks.length > 0 ? (
                footerLinks.map((l) => (
                  <li key={l.label}><Link href={l.url} className="hover:text-sm-cyan transition-colors">{l.label}</Link></li>
                ))
              ) : (
                <>
                  <li><Link href="/" className="hover:text-sm-cyan transition-colors">Livraison & Retours</Link></li>
                  <li><Link href="/" className="hover:text-sm-cyan transition-colors">Guide des tailles</Link></li>
                  <li><Link href="/" className="hover:text-sm-cyan transition-colors">Contact</Link></li>
                </>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-sm-lightgray text-center text-sm text-sm-gray">
          <p>© 2026 #SAINTEMAXIME® – Marque déposée – contact@hashtagsaintemaxime.fr</p>
          <div className="flex justify-center gap-6 mt-2">
            {legalLinks.length > 0 ? (
              legalLinks.map((l) => (
                <Link key={l.label} href={l.url} className="hover:text-sm-cyan transition-colors">{l.label}</Link>
              ))
            ) : (
              <>
                <Link href="/" className="hover:text-sm-cyan transition-colors">CGV</Link>
                <Link href="/" className="hover:text-sm-cyan transition-colors">Confidentialité</Link>
                <Link href="/" className="hover:text-sm-cyan transition-colors">Mentions légales</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

interface HeroProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
}

export default function Hero({ title, subtitle, buttonText }: HeroProps) {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32 min-h-[600px] sm:min-h-[720px] flex items-center">
      {/* Photo fixe #SAINTEMAXIME */}
      <div className="absolute inset-0">
        {/* Arrière-plan flouté (même photo, agrandie) pour combler les bords sans recadrer la photo nette */}
        <Image
          src="/images/hero/saintemaxime.jpg"
          alt=""
          fill
          aria-hidden
          sizes="100vw"
          className="object-cover scale-125 blur-2xl brightness-50"
        />
        {/* Photo nette, entière, jamais recadrée */}
        <Image
          src="/images/hero/saintemaxime.jpg"
          alt="#SAINTEMAXIME — panneau emblématique en bord de plage à Sainte-Maxime"
          fill
          priority
          sizes="100vw"
          className="object-contain"
        />
        {/* Overlay pour garder le texte blanc lisible sur la photo */}
        <div className="absolute inset-0 bg-gradient-to-b from-sm-deep/70 via-sm-deep/40 to-sm-deep/80" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold text-white tracking-tight mb-2 drop-shadow-lg">
            #SAINTEMAXIME
          </h1>
          <p className="text-white text-lg sm:text-xl font-medium mb-2 drop-shadow">
            {title || "La Marque Officielle de Sainte-Maxime"}
          </p>
          <p className="text-white/90 text-sm sm:text-base mb-8 drop-shadow">
            {subtitle || "Vêtements · Accessoires · Souvenirs · Lifestyle"}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10"
        >
          <Link
            href="/boutique/"
            className="inline-flex items-center gap-2 bg-sm-coral text-white font-semibold px-8 py-4 rounded-full hover:bg-sm-coral/90 transition-all shadow-coral hover:shadow-lg hover:-translate-y-0.5"
          >
            {buttonText || "Découvrir la Collection Été"}
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/le-coeur-au-sol/"
            className="inline-flex items-center gap-2 bg-white text-sm-deep font-semibold px-8 py-4 rounded-full hover:bg-white/90 transition-all shadow-lg"
          >
            <Sparkles className="w-5 h-5 text-sm-coral" />
            Le Cœur au Sol
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="inline-flex items-center gap-2 bg-white/95 backdrop-blur-sm text-sm-dark px-6 py-3 rounded-full text-sm font-medium shadow-lg"
        >
          <span className="text-sm-coral">💎</span>
          <span>1 247 personnes ont adopté le style #SAINTEMAXIME ce mois-ci</span>
        </motion.div>
      </div>
    </section>
  );
}

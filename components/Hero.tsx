"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-sm-cyan to-sm-deep py-24 sm:py-32">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full border-2 border-white" />
        <div className="absolute bottom-20 right-20 w-48 h-48 rounded-full border-2 border-white" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border border-white/30" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold text-white tracking-tight mb-2">
            #SAINTEMAXIME
          </h1>
          <p className="text-white/90 text-lg sm:text-xl font-medium mb-2">
            La Marque Officielle de Sainte-Maxime
          </p>
          <p className="text-white/70 text-sm sm:text-base mb-8">
            Vêtements · Accessoires · Souvenirs · Lifestyle
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
            Découvrir la Collection Été
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/le-coeur-au-sol/"
            className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white font-semibold px-8 py-4 rounded-full hover:bg-white/30 transition-all border border-white/30"
          >
            <Sparkles className="w-5 h-5" />
            Le Cœur au Sol
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm text-sm-dark px-6 py-3 rounded-full text-sm font-medium shadow-sm"
        >
          <span className="text-sm-coral">💎</span>
          <span>1 247 personnes ont adopté le style #SAINTEMAXIME ce mois-ci</span>
        </motion.div>
      </div>
    </section>
  );
}

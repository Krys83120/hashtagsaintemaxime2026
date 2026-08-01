"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

const slides = [
  { src: "/images/hero/hero-1.jpg", alt: "Panneau #SAINTEMAXIME sur la plage, ciel bleu" },
  { src: "/images/hero/hero-2.jpg", alt: "Panneau #SAINTEMAXIME face à la mer" },
  { src: "/images/hero/hero-3.jpg", alt: "Panneau #SAINTEMAXIME sur la promenade" },
  { src: "/images/hero/hero-4.jpg", alt: "Panneau #SAINTEMAXIME vue large plage" },
  { src: "/images/hero/hero-5.jpg", alt: "Panneau #SAINTEMAXIME au coucher de soleil" },
];

export default function Hero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative overflow-hidden py-24 sm:py-32 min-h-[600px] sm:min-h-[720px] flex items-center">
      {/* Carrousel photo plein largeur */}
      <div className="absolute inset-0">
        <AnimatePresence initial={false}>
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            {/* Arrière-plan flouté (même photo, agrandie) pour combler les bords sans recadrer la photo nette */}
            <Image
              src={slides[index].src}
              alt=""
              fill
              aria-hidden
              sizes="100vw"
              className="object-cover scale-125 blur-2xl brightness-50"
            />
            {/* Photo nette, entière, jamais recadrée */}
            <Image
              src={slides[index].src}
              alt={slides[index].alt}
              fill
              priority={index === 0}
              sizes="100vw"
              className="object-contain"
            />
          </motion.div>
        </AnimatePresence>
        {/* Overlay pour garder le texte blanc lisible sur toutes les photos */}
        <div className="absolute inset-0 bg-gradient-to-b from-sm-deep/70 via-sm-deep/40 to-sm-deep/80" />
      </div>

      {/* Indicateurs du carrousel */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Voir la photo ${i + 1}`}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? "w-8 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
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
            La Marque Officielle de Sainte-Maxime
          </p>
          <p className="text-white/90 text-sm sm:text-base mb-8 drop-shadow">
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

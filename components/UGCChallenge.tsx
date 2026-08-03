"use client";

import { motion } from "framer-motion";
import { Camera, MapPin } from "lucide-react";
import Image from "next/image";

interface UGCChallengeProps {
  instagramHashtagCount?: number;
}

function formatCount(n: number): string {
  // Format avec des points tous les 3 chiffres, ex: 218.000
  return n.toLocaleString("de-DE");
}

export default function UGCChallenge({ instagramHashtagCount = 218000 }: UGCChallengeProps) {
  return (
    <section className="bg-sm-cream py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="aspect-[4/5] bg-gradient-to-br from-sm-cyan/20 to-sm-coral/20 rounded-2xl relative overflow-hidden">
              <Image
                src="/images/coeur-au-sol.jpg"
                alt="Cœur #SAINTEMAXIME peint au sol, rue piétonne de Sainte-Maxime"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain"
                priority
              />
            </div>
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm-coral text-2xl">❤️</span>
              <span className="text-sm-coral font-bold text-lg uppercase tracking-wide">
                Trouve le Cœur
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-sm-deep mb-6">
              L'Expérience Instagrammable
            </h2>
            <p className="text-sm-dark text-base leading-relaxed mb-6">
              Prends une photo au cœur <strong>#SAINTEMAXIME</strong> au sol, partage-la avec le hashtag et gagne <strong className="text-sm-coral">-15%</strong> sur ta prochaine commande + une chance de remporter le <strong>Kit Été Complet</strong> !
            </p>

            <div className="mb-8">
              <a
                href="https://maps.app.goo.gl/1erWn4UA46BBbUsK6"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 bg-white p-4 rounded-xl shadow-sm max-w-xs hover:shadow-md hover:ring-2 hover:ring-sm-cyan/30 transition-all"
              >
                <MapPin className="w-5 h-5 text-sm-cyan mt-0.5" />
                <div>
                  <p className="font-semibold text-sm-dark text-sm">Localisation</p>
                  <p className="text-sm-gray text-sm">Rue piétonne, Sainte-Maxime</p>
                  <p className="text-sm-cyan text-xs mt-1 font-medium">Voir sur la carte →</p>
                </div>
              </a>
            </div>

            <a
              href="https://www.instagram.com/hashtag_saintemaxime/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-sm-coral to-sm-cyan text-white font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity"
            >
              <Camera className="w-5 h-5" />
              Participer sur Instagram
            </a>

            <p className="text-sm-gray text-sm mt-4">
              📸 <strong>{formatCount(instagramHashtagCount)} photos et vidéos</strong> avec la mention #SAINTEMAXIME sur Instagram, partagez les vôtres !
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

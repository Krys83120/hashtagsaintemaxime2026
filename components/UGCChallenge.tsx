"use client";

import { motion } from "framer-motion";
import { Camera, MapPin, QrCode } from "lucide-react";
import Image from "next/image";

export default function UGCChallenge() {
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
            <div className="aspect-[4/5] sm:aspect-[4/3] bg-gradient-to-br from-sm-cyan/20 to-sm-coral/20 rounded-2xl relative overflow-hidden">
              <Image
                src="/images/coeur-au-sol.jpg"
                alt="Cœur #SAINTEMAXIME peint au sol, rue piétonne de Sainte-Maxime"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover object-top"
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

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="flex items-start gap-3 bg-white p-4 rounded-xl shadow-sm">
                <MapPin className="w-5 h-5 text-sm-cyan mt-0.5" />
                <div>
                  <p className="font-semibold text-sm-dark text-sm">Localisation</p>
                  <p className="text-sm-gray text-sm">Rue piétonne, Sainte-Maxime</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-white p-4 rounded-xl shadow-sm">
                <QrCode className="w-5 h-5 text-sm-coral mt-0.5" />
                <div>
                  <p className="font-semibold text-sm-dark text-sm">QR Code</p>
                  <p className="text-sm-gray text-sm">Scanne au cœur pour -10%</p>
                </div>
              </div>
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
              📸 <strong>2 847 photos</strong> déjà partagées avec #SAINTEMAXIME
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

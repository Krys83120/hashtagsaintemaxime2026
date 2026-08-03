"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gift } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface WheelSegment {
  label: string;
  color: string;
  weight: number;
  promoCode?: string;
}

const DEFAULT_SEGMENTS: WheelSegment[] = [
  { label: "-10%", color: "#00D4E8", weight: 30 },
  { label: "Livraison Offerte", color: "#FF6B8A", weight: 25 },
  { label: "-15% dès 50€", color: "#0085A1", weight: 20 },
  { label: "Bracelet Offert", color: "#FFD700", weight: 15 },
  { label: "-20%", color: "#FF6B8A", weight: 10 },
];

function pickWeightedSegment(segments: WheelSegment[]): { segment: WheelSegment; index: number } {
  const total = segments.reduce((sum, s) => sum + s.weight, 0);
  let r = Math.random() * total;
  for (let i = 0; i < segments.length; i++) {
    r -= segments[i].weight;
    if (r <= 0) return { segment: segments[i], index: i };
  }
  return { segment: segments[segments.length - 1], index: segments.length - 1 };
}

export default function SpinWheel() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<WheelSegment | null>(null);
  const [email, setEmail] = useState("");
  const [segments, setSegments] = useState<WheelSegment[]>(DEFAULT_SEGMENTS);
  const [title, setTitle] = useState("🎰 Roue de la Fortune");
  const [subtitle, setSubtitle] = useState("Tourne la roue et gagne jusqu'à -20% ou une livraison offerte !");

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: settingsRow } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "spin_wheel_config")
        .maybeSingle();

      const config = (settingsRow?.value as any) || {};
      if (config.enabled === false) return;
      if (config.segments?.length) setSegments(config.segments);
      if (config.title) setTitle(config.title);
      if (config.subtitle) setSubtitle(config.subtitle);

      const delaySeconds = config.delaySeconds ?? 5;

      // Vérifie côté serveur (par IP) si la roue peut s'afficher (limite de fréquence)
      try {
        const res = await fetch("/api/spin-wheel/check");
        const data = await res.json();
        if (!data.allowed) return;
      } catch {
        return; // en cas d'erreur réseau, on n'affiche pas plutôt que de spammer
      }

      const timer = setTimeout(() => setIsOpen(true), delaySeconds * 1000);
      return () => clearTimeout(timer);
    };
    init();
  }, []);

  const spin = () => {
    if (isSpinning || !email) return;
    setIsSpinning(true);

    const { segment, index } = pickWeightedSegment(segments);
    const segmentAngle = 360 / segments.length;
    // Centre le segment choisi sous le repère du haut, avec plusieurs tours pour l'effet
    const targetAngle = 360 - (index * segmentAngle + segmentAngle / 2);
    const extraSpins = 5;
    const newRotation = rotation + extraSpins * 360 + targetAngle - (rotation % 360);

    setRotation(newRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setResult(segment);
    }, 3000);
  };

  const close = () => {
    setIsOpen(false);
    setResult(null);
    setIsSpinning(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 relative"
          >
            <button
              onClick={close}
              className="absolute top-4 right-4 p-1 hover:bg-sm-cream rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-sm-gray" />
            </button>

            {!result ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-sm-cyan/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gift className="w-8 h-8 text-sm-cyan" />
                </div>
                <h3 className="text-2xl font-bold text-sm-dark mb-2">{title}</h3>
                <p className="text-sm-gray text-sm mb-6">{subtitle}</p>

                <div className="relative w-64 h-64 mx-auto mb-6">
                  <motion.div
                    className="w-full h-full rounded-full border-4 border-sm-cyan shadow-lg relative overflow-hidden"
                    animate={{ rotate: rotation }}
                    transition={{ duration: 3, ease: "easeOut" }}
                    style={{ transformOrigin: "center" }}
                  >
                    {segments.map((segment, i) => (
                      <div
                        key={i}
                        className="absolute w-full h-full"
                        style={{
                          background: `conic-gradient(from ${i * (360 / segments.length)}deg, ${segment.color} 0deg, ${segment.color} ${360 / segments.length}deg, transparent ${360 / segments.length}deg)`,
                          clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos((i * (360 / segments.length) - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin((i * (360 / segments.length) - 90) * Math.PI / 180)}%, ${50 + 50 * Math.cos(((i + 1) * (360 / segments.length) - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin(((i + 1) * (360 / segments.length) - 90) * Math.PI / 180)}%)`,
                        }}
                      />
                    ))}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center">
                        <span className="text-sm-cyan font-bold text-lg">#</span>
                      </div>
                    </div>
                  </motion.div>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-sm-coral" />
                </div>

                <input
                  type="email"
                  placeholder="Ton email..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-sm-lightgray focus:border-sm-cyan focus:ring-2 focus:ring-sm-cyan/20 outline-none mb-3 text-sm"
                />
                <button
                  onClick={spin}
                  disabled={isSpinning || !email}
                  className="w-full bg-sm-coral text-white font-bold py-3 rounded-xl hover:bg-sm-coral/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSpinning ? "La roue tourne..." : "Tourner la Roue !"}
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-5xl mb-4"
                >
                  🎉
                </motion.div>
                <h3 className="text-2xl font-bold text-sm-dark mb-2">Tu as gagné !</h3>
                <p className="text-3xl font-black text-sm-coral mb-4">{result.label}</p>
                {result.promoCode ? (
                  <p className="text-sm text-sm-gray mb-6">
                    Utilise le code <strong className="text-sm-dark font-mono">{result.promoCode}</strong> lors de ton prochain achat.
                  </p>
                ) : (
                  <p className="text-sm text-sm-gray mb-6">
                    Un email va bientôt t'être envoyé avec ton code de réduction.
                  </p>
                )}
                <button
                  onClick={close}
                  className="bg-sm-cyan text-white font-bold px-8 py-3 rounded-xl hover:bg-sm-deep transition-colors"
                >
                  Continuer mes achats
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

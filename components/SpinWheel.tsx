"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gift } from "lucide-react";

const WHEEL_SEGMENTS = [
  { label: "-10%", color: "#00D4E8", weight: 30 },
  { label: "Livraison Offerte", color: "#FF6B8A", weight: 25 },
  { label: "-15% dès 50€", color: "#0085A1", weight: 20 },
  { label: "Bracelet Offert", color: "#FFD700", weight: 15 },
  { label: "-20%", color: "#FF6B8A", weight: 10 },
];

export default function SpinWheel() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsOpen(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  const spin = () => {
    if (isSpinning || !email) return;
    setIsSpinning(true);
    const extraSpins = 5;
    const randomDeg = Math.floor(Math.random() * 360);
    const newRotation = rotation + extraSpins * 360 + randomDeg;
    setRotation(newRotation);

    setTimeout(() => {
      setIsSpinning(false);
      const segmentIndex = Math.floor((360 - (newRotation % 360)) / (360 / WHEEL_SEGMENTS.length)) % WHEEL_SEGMENTS.length;
      setResult(WHEEL_SEGMENTS[segmentIndex].label);
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

            {!submitted && !result ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-sm-cyan/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gift className="w-8 h-8 text-sm-cyan" />
                </div>
                <h3 className="text-2xl font-bold text-sm-dark mb-2">🎰 Roue de la Fortune</h3>
                <p className="text-sm-gray text-sm mb-6">
                  Tourne la roue et gagne jusqu'à -20% ou une livraison offerte !
                </p>

                <div className="relative w-64 h-64 mx-auto mb-6">
                  <motion.div
                    className="w-full h-full rounded-full border-4 border-sm-cyan shadow-lg relative overflow-hidden"
                    animate={{ rotate: rotation }}
                    transition={{ duration: 3, ease: "easeOut" }}
                    style={{ transformOrigin: "center" }}
                  >
                    {WHEEL_SEGMENTS.map((segment, i) => (
                      <div
                        key={i}
                        className="absolute w-full h-full"
                        style={{
                          background: `conic-gradient(from ${i * (360 / WHEEL_SEGMENTS.length)}deg, ${segment.color} 0deg, ${segment.color} ${360 / WHEEL_SEGMENTS.length}deg, transparent ${360 / WHEEL_SEGMENTS.length}deg)`,
                          clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos((i * (360 / WHEEL_SEGMENTS.length) - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin((i * (360 / WHEEL_SEGMENTS.length) - 90) * Math.PI / 180)}%, ${50 + 50 * Math.cos(((i + 1) * (360 / WHEEL_SEGMENTS.length) - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin(((i + 1) * (360 / WHEEL_SEGMENTS.length) - 90) * Math.PI / 180)}%)`,
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
            ) : result ? (
              <div className="text-center py-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-5xl mb-4"
                >
                  🎉
                </motion.div>
                <h3 className="text-2xl font-bold text-sm-dark mb-2">Tu as gagné !</h3>
                <p className="text-3xl font-black text-sm-coral mb-4">{result}</p>
                <p className="text-sm text-sm-gray mb-6">
                  Utilise le code envoyé par email pour ta prochaine commande.
                </p>
                <button
                  onClick={close}
                  className="bg-sm-cyan text-white font-bold px-8 py-3 rounded-xl hover:bg-sm-deep transition-colors"
                >
                  Continuer mes achats
                </button>
              </div>
            ) : null}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

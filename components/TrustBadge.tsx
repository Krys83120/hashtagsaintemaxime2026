"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const notifications = [
  { name: "Marie", location: "Sainte-Maxime", action: "a acheté un T-Shirt", time: "il y a 2 min" },
  { name: "Thomas", location: "Paris", action: "a acheté une Casquette", time: "il y a 5 min" },
  { name: "Julie", location: "Lyon", action: "a acheté une Serviette", time: "il y a 8 min" },
  { name: "Paul", location: "Toulon", action: "a acheté un Mug", time: "il y a 12 min" },
  { name: "Sophie", location: "Nice", action: "a acheté une Bouteille", time: "il y a 15 min" },
];

export default function TrustBadge() {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const showTimer = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(showTimer);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % notifications.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className="fixed bottom-6 left-6 z-50 bg-white rounded-xl shadow-lg border border-sm-lightgray p-3 max-w-xs"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-sm-cyan/10 flex items-center justify-center text-sm-cyan font-bold text-sm">
                {notifications[current].name.charAt(0)}
              </div>
              <div className="text-sm">
                <p className="text-sm-dark">
                  <span className="font-semibold">{notifications[current].name}</span> {notifications[current].action}
                </p>
                <p className="text-sm-gray text-xs">
                  {notifications[current].location} · {notifications[current].time}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

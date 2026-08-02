"use client";

import { X } from "lucide-react";
import { useState } from "react";

interface TopBarProps {
  text?: string;
  active?: boolean;
}

export default function TopBar({ text, active = true }: TopBarProps) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed || !active) return null;

  return (
    <div className="bg-sm-cyan text-white text-sm py-2.5 px-4 relative">
      <div className="max-w-7xl mx-auto text-center flex items-center justify-center gap-2">
        <span>{text || "🌴 C'est l'été dans le Golfe ! Livraison offerte dès 60€ — Code : ETE2026"}</span>
        <button
          onClick={() => setDismissed(true)}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded-full transition-colors"
          aria-label="Fermer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Cookie } from "lucide-react";

export const COOKIE_CONSENT_KEY = "sm-cookie-consent";
export const COOKIE_CONSENT_EVENT = "sm-cookie-consent-changed";

export type ConsentValue = "accepted" | "rejected";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const existing = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!existing) setVisible(true);
  }, []);

  const choose = (value: ConsentValue) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, value);
    window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT, { detail: value }));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center">
        <div className="w-14 h-14 bg-sm-cyan/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Cookie className="w-7 h-7 text-sm-cyan" />
        </div>
        <h2 className="text-xl font-bold text-sm-dark mb-3">On utilise des cookies 🍪</h2>
        <p className="text-sm text-sm-gray leading-relaxed mb-6">
          #SAINTEMAXIME utilise des cookies pour améliorer ton expérience, mesurer notre audience et te proposer un
          contenu pertinent. Tu peux accepter ou refuser leur utilisation à tout moment.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => choose("rejected")}
            className="flex-1 border-2 border-sm-lightgray text-sm-dark font-semibold py-3 rounded-full hover:bg-sm-cream transition-colors"
          >
            Refuser
          </button>
          <button
            onClick={() => choose("accepted")}
            className="flex-1 bg-sm-cyan text-white font-semibold py-3 rounded-full hover:bg-sm-deep transition-colors"
          >
            Accepter tout
          </button>
        </div>
        <p className="text-xs text-sm-gray mt-4">
          Pour en savoir plus, consulte notre{" "}
          <a href="/confidentialite/" className="text-sm-cyan hover:underline">
            politique de confidentialité
          </a>
          .
        </p>
      </div>
    </div>
  );
}

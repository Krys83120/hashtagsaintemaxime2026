"use client";

import { useEffect } from "react";

interface TagembedFeedProps {
  widgetId: string;
}

/**
 * Intègre un widget Tagembed (agrégateur de flux Instagram/réseaux sociaux).
 * Le widgetId se récupère depuis ton tableau de bord sur tagembed.com,
 * une fois ton compte Instagram et ton hashtag #SAINTEMAXIME configurés là-bas.
 */
export default function TagembedFeed({ widgetId }: TagembedFeedProps) {
  useEffect(() => {
    // Évite d'injecter le script Tagembed plusieurs fois si le composant remonte
    if (document.getElementById("tagembed-embed-script")) return;

    const script = document.createElement("script");
    script.id = "tagembed-embed-script";
    script.src = "https://widget.tagembed.com/embed.min.js";
    script.type = "text/javascript";
    script.defer = true;
    document.body.appendChild(script);
  }, []);

  return (
    <div
      className="tagembed-widget"
      data-widget-id={widgetId}
      data-website="1"
      style={{ width: "100%" }}
    />
  );
}

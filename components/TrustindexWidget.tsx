"use client";

import { useEffect, useRef } from "react";

interface TrustindexWidgetProps {
  /** La partie après "loader.js?" dans le code fourni par Trustindex, ex: "111fa111950c622dern267v531" */
  widgetCode: string;
}

/**
 * Intègre un widget Trustindex (avis Google, Facebook, etc.).
 * Le widgetCode se récupère dans le code d'intégration fourni par Trustindex :
 * <script defer async src='https://cdn.trustindex.io/loader.js?CE_CODE_ICI'></script>
 */
export default function TrustindexWidget({ widgetCode }: TrustindexWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Repart d'un conteneur vide à chaque montage pour permettre au script de se réinjecter
    container.innerHTML = "";

    const script = document.createElement("script");
    script.defer = true;
    script.async = true;
    script.src = `https://cdn.trustindex.io/loader.js?${widgetCode}`;
    container.appendChild(script);
  }, [widgetCode]);

  return <div ref={containerRef} className="w-full" />;
}

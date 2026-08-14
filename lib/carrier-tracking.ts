export function getCarrierTrackingUrl(carrier: string | null | undefined, trackingNumber: string | null | undefined): string | null {
  if (!trackingNumber) return null;
  const c = (carrier || "").toLowerCase().trim();
  const n = encodeURIComponent(trackingNumber.trim());

  if (c.includes("colissimo")) return `https://www.laposte.fr/outils/suivre-vos-envois?code=${n}`;
  if (c.includes("chronopost")) return `https://www.chronopost.fr/tracking-no-cms/suivi-page?listeNumerosLT=${n}`;
  if (c.includes("mondial relay") || c.includes("mondialrelay")) return `https://www.mondialrelay.fr/suivi-de-colis/?numeroExpedition=${n}`;
  if (c.includes("ups")) return `https://www.ups.com/track?tracknum=${n}`;
  if (c.includes("dhl")) return `https://www.dhl.com/fr-fr/home/tracking/tracking-express.html?submit=1&tracking-id=${n}`;
  if (c.includes("dpd")) return `https://trace.dpd.fr/fr/trace/${n}`;
  if (c.includes("fedex")) return `https://www.fedex.com/fedextrack/?trknbr=${n}`;
  if (c.includes("gls")) return `https://gls-group.eu/FR/fr/suivi-colis?match=${n}`;
  if (c.includes("la poste") || c.includes("laposte")) return `https://www.laposte.fr/outils/suivre-vos-envois?code=${n}`;

  // Transporteur inconnu ou non renseigné précisément : ParcelsApp en secours (détecte le transporteur automatiquement)
  return getParcelsAppTrackingUrl(trackingNumber);
}

/**
 * Lien de suivi universel ParcelsApp.com : détecte automatiquement le transporteur
 * à partir du numéro de suivi. Fonctionne pour (quasi) tous les transporteurs du monde,
 * pratique en complément du lien direct du transporteur.
 */
export function getParcelsAppTrackingUrl(trackingNumber: string | null | undefined): string | null {
  if (!trackingNumber) return null;
  return `https://parcelsapp.com/fr/tracking?number=${encodeURIComponent(trackingNumber.trim())}`;
}

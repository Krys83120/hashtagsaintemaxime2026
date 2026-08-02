export interface SiteImageSlot {
  key: string;
  label: string;
  defaultUrl: string;
  defaultAlt: string;
  hint: string;
}

export const SITE_IMAGE_SLOTS: SiteImageSlot[] = [
  {
    key: "heroHome",
    label: "Accueil — Photo du Hero",
    defaultUrl: "/images/hero/saintemaxime.jpg",
    defaultAlt: "#SAINTEMAXIME — panneau emblématique en bord de plage à Sainte-Maxime",
    hint: "Photo plein écran affichée tout en haut de la page d'accueil.",
  },
  {
    key: "laMarqueHero",
    label: "La Marque — Photo pleine largeur",
    defaultUrl: "/images/la-marque-hero.jpg",
    defaultAlt: "Le panneau #SAINTEMAXIME au coucher de soleil, face à la plage de Sainte-Maxime",
    hint: "Photo pleine largeur au-dessus de « Notre Histoire » sur la page La Marque.",
  },
  {
    key: "coeurAuSol1",
    label: "Cœur au Sol — Photo 1",
    defaultUrl: "/images/coeur-au-sol.jpg",
    defaultAlt: "Le cœur #SAINTEMAXIME peint au sol à Sainte-Maxime",
    hint: "Première photo de la galerie sur la page Le Cœur au Sol.",
  },
  {
    key: "coeurAuSol2",
    label: "Cœur au Sol — Photo 2",
    defaultUrl: "/images/coeur-au-sol-2.jpg",
    defaultAlt: "Le cœur #SAINTEMAXIME peint au sol dans une ruelle du centre-ville de Sainte-Maxime",
    hint: "Deuxième photo, affichée juste à côté de la première.",
  },
];

export interface SiteImageValue {
  url: string;
  alt: string;
}

export type SiteImagesMap = Record<string, SiteImageValue>;

export function resolveSiteImage(images: SiteImagesMap | undefined, slot: SiteImageSlot): SiteImageValue {
  const override = images?.[slot.key];
  return {
    url: override?.url || slot.defaultUrl,
    alt: override?.alt || slot.defaultAlt,
  };
}

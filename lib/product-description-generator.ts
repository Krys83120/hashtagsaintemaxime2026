interface ProductForDescription {
  name: string;
  category?: string;
  categories?: string[];
  colors?: { name: string }[];
  sizes?: string[];
}

interface TypeTemplate {
  match: RegExp;
  intro: (name: string) => string;
  usage: string;
  material: string;
}

const TYPE_TEMPLATES: TypeTemplate[] = [
  {
    match: /t-?shirt/i,
    intro: (name) => `Le ${name} est le basique intemporel pour afficher fièrement tes couleurs #SAINTEMAXIME, à Sainte-Maxime comme partout dans le Golfe de Saint-Tropez.`,
    usage: "Parfait au quotidien, à la plage ou en soirée d'été.",
    material: "Coton doux, impression DTG haute définition qui résiste aux lavages.",
  },
  {
    match: /sweat|hoodie|capuche/i,
    intro: (name) => `Le ${name} habille tes soirées fraîches sur la Côte d'Azur avec le style #SAINTEMAXIME.`,
    usage: "Idéal en fin de journée sur le port ou pour les soirées d'été plus fraîches.",
    material: "Molleton épais, coupe confortable, impression durable.",
  },
  {
    match: /casquette/i,
    intro: (name) => `La ${name} protège du soleil tout en affichant fièrement l'esprit #SAINTEMAXIME.`,
    usage: "L'accessoire indispensable pour les journées ensoleillées à Sainte-Maxime.",
    material: "Visière rigide, ajustable, broderie ou impression résistante.",
  },
  {
    match: /mug|tasse/i,
    intro: (name) => `Le ${name} accompagne ton café ou ton thé du matin avec un souvenir de Sainte-Maxime.`,
    usage: "Parfait pour la maison, le bureau, ou comme cadeau souvenir.",
    material: "Céramique de qualité, résistant au lave-vaisselle et micro-ondes.",
  },
  {
    match: /bouteille|gourde/i,
    intro: (name) => `La ${name} t'accompagne partout dans le Golfe de Saint-Tropez, de la plage aux balades en ville.`,
    usage: "Reste hydraté·e toute la journée, à la plage ou en balade dans Sainte-Maxime.",
    material: "Conception isotherme ou légère selon le modèle, robuste au quotidien.",
  },
  {
    match: /coque/i,
    intro: (name) => `La ${name} protège ton téléphone tout en affichant ton amour pour Sainte-Maxime.`,
    usage: "Un accessoire du quotidien, discret et stylé, pour ne jamais oublier d'où tu viens.",
    material: "Impression haute définition résistante aux rayures et aux chocs légers.",
  },
  {
    match: /housse.*(ordinateur|pc|macbook|portable)/i,
    intro: (name) => `La ${name} protège ton ordinateur portable avec style, où que tu travailles.`,
    usage: "Parfaite pour le télétravail, les déplacements ou juste pour afficher tes couleurs.",
    material: "Rembourrage protecteur, fermeture pratique, impression durable.",
  },
  {
    match: /sac.*(dos)/i,
    intro: (name) => `Le ${name} t'accompagne pour toutes tes journées à Sainte-Maxime, de la plage aux balades en ville.`,
    usage: "Assez spacieux pour tes essentiels de plage ou tes affaires du quotidien.",
    material: "Tissu résistant, compartiments pratiques.",
  },
  {
    match: /sac|cabas|tote/i,
    intro: (name) => `Le ${name} est ton compagnon shopping ou plage, pratique et stylé aux couleurs #SAINTEMAXIME.`,
    usage: "Idéal pour les courses au marché, la plage, ou en tote bag du quotidien.",
    material: "Toile résistante et légère, anses solides.",
  },
  {
    match: /serviette/i,
    intro: (name) => `La ${name} t'accompagne pour toutes tes journées plage à Sainte-Maxime.`,
    usage: "Douce, absorbante, elle sèche vite entre deux baignades dans le Golfe de Saint-Tropez.",
    material: "Tissu doux et absorbant, séchage rapide.",
  },
  {
    match: /bougie/i,
    intro: (name) => `La ${name} apporte une ambiance douce et parfumée chez toi, en souvenir de tes étés à Sainte-Maxime.`,
    usage: "Parfaite pour la décoration intérieure ou comme cadeau souvenir.",
    material: "Cire de soja, parfum longue tenue.",
  },
  {
    match: /sticker|autocollant/i,
    intro: (name) => `Le ${name} permet de personnaliser tes affaires (ordinateur, valise, gourde...) avec le style #SAINTEMAXIME.`,
    usage: "Facile à coller, résistant à l'eau, pour afficher ton amour de Sainte-Maxime partout.",
    material: "Vinyle holographique ou mat résistant aux intempéries.",
  },
  {
    match: /claquette|tong/i,
    intro: (name) => `Les ${name} sont l'accessoire plage indispensable de l'été, aux couleurs #SAINTEMAXIME.`,
    usage: "Confortables pour la plage, la piscine ou les balades décontractées à Sainte-Maxime.",
    material: "Semelle légère et confortable, séchage rapide.",
  },
  {
    match: /bracelet/i,
    intro: (name) => `Le ${name} est un petit rappel discret de ton attachement à Sainte-Maxime, à porter au quotidien.`,
    usage: "Léger et discret, il s'associe à toutes tes tenues d'été.",
    material: "Silicone souple, résistant à l'eau.",
  },
  {
    match: /coussin/i,
    intro: (name) => `Le ${name} apporte une touche déco Côte d'Azur à ton intérieur ou ta terrasse.`,
    usage: "Pour la maison, le salon ou la terrasse — un souvenir déco de Sainte-Maxime.",
    material: "Housse douce, garnissage confortable.",
  },
];

const CATEGORY_LABELS: Record<string, string> = {
  "vetements-homme": "vêtements",
  "vetements-femme": "vêtements",
  "accessoires": "accessoires",
  "vie-quotidienne": "objets du quotidien",
};

function findTemplate(name: string): TypeTemplate | undefined {
  return TYPE_TEMPLATES.find((t) => t.match.test(name));
}

export function generateProductDescription(product: ProductForDescription): string {
  const template = findTemplate(product.name);
  const categories = product.categories?.length ? product.categories : [product.category].filter(Boolean) as string[];
  const categoryLabel = categories.map((c) => CATEGORY_LABELS[c] || c).join(" et ");

  const colorNote = product.colors && product.colors.length > 1
    ? ` Disponible en ${product.colors.length} coloris : ${product.colors.map((c) => c.name).join(", ")}.`
    : "";
  const sizeNote = product.sizes && product.sizes.length > 1 && !product.sizes.includes("One Size")
    ? ` Du ${product.sizes[0]} au ${product.sizes[product.sizes.length - 1]}.`
    : "";

  if (template) {
    return `${template.intro(product.name)} ${template.usage} ${template.material}${colorNote}${sizeNote} Produit officiel de la marque déposée #SAINTEMAXIME®, dessiné avec fierté pour tous les amoureux de Sainte-Maxime et du Golfe de Saint-Tropez.`;
  }

  return `Le ${product.name} fait partie de la collection ${categoryLabel} #SAINTEMAXIME®, la marque officielle de Sainte-Maxime depuis 2019. Un souvenir unique et de qualité pour célébrer ton attachement au Golfe de Saint-Tropez.${colorNote}${sizeNote} Impression soignée, fabrication à la demande.`;
}

export function generateProductDetails(product: ProductForDescription): string[] {
  const details = ["Design exclusif #SAINTEMAXIME®", "Fabriqué à la demande via Printful", "Livraison soignée 3-5 jours", "Retours sous 30 jours"];
  const template = findTemplate(product.name);
  if (template) details.splice(1, 0, template.material);
  return details;
}

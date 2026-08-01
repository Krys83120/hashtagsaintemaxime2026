const fs = require('fs');
const path = require('path');

// ============================================
// SCRIPT DE SYNCHRONISATION PRINTFUL → NEXT.JS
// #SAINTEMAXIME 2026
// ============================================
//
// Utilisation :
//   1. Créer un fichier .env à la racine avec :
//      PRINTFUL_API_KEY=<CLE_API_PRINTFUL>
//   2. npm run sync:printful
//   3. Le fichier lib/products.ts est régénéré automatiquement
//
// ============================================

const PRINTFUL_API_URL = 'https://api.printful.com/v2';

// Charger la clé API depuis .env
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    console.error('❌ Fichier .env introuvable. Crée un fichier .env avec PRINTFUL_API_KEY=...');
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, 'utf-8');
  const match = envContent.match(/PRINTFUL_API_KEY=(.+)/);
  if (!match) {
    console.error('❌ PRINTFUL_API_KEY non trouvé dans le fichier .env');
    process.exit(1);
  }

  return match[1].trim();
}

// Appel API Printful
async function printfulFetch(endpoint, apiKey) {
  const res = await fetch(`${PRINTFUL_API_URL}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(`Printful API Error ${res.status}: ${error.message || res.statusText}`);
  }

  return res.json();
}

// Mapper un produit Printful au format interne
function mapPrintfulProduct(pfProduct, index) {
  const product = pfProduct.data || pfProduct;
  
  // Extraire les variantes
  const variants = product.variants || [];
  const sizes = [...new Set(variants.map(v => v.size).filter(Boolean))];
  const colors = [...new Set(variants.map(v => v.color).filter(Boolean))].map(c => ({
    name: c,
    hex: colorToHex(c),
  }));

  // Déterminer la catégorie
  const category = detectCategory(product.name, product.type);

  // Prix : on prend le retail_price du premier variant ou on estime
  const retailPrice = variants[0]?.retail_price || variants[0]?.price || 0;
  const price = Math.round(parseFloat(retailPrice) * 1.5); // Marge 50%

  return {
    id: `${index + 1}`,
    slug: slugify(product.name),
    name: product.name,
    price: price,
    category: category,
    image: product.thumbnail_url || '/images/product-placeholder.jpg',
    badge: index === 0 ? 'BESTSELLER' : index < 3 ? 'NOUVEAU' : '',
    description: product.description || `${product.name} – Produit officiel #SAINTEMAXIME. Design exclusif, qualité premium.`,
    details: [
      'Impression haute définition DTG',
      'Fabriqué à la demande via Printful',
      'Livraison soignée 3-5 jours',
      'Retours sous 30 jours',
    ],
    colors: colors.length > 0 ? colors : [{ name: 'Blanc', hex: '#FFFFFF' }],
    sizes: sizes.length > 0 ? sizes : ['One Size'],
    reviews: [],
    inStock: true,
    stockCount: Math.floor(Math.random() * 20) + 5,
  };
}

// Détecter la catégorie
function detectCategory(name, type) {
  const lower = name.toLowerCase();
  if (lower.includes('t-shirt') || lower.includes('shirt') || lower.includes('tee') || lower.includes('sweat') || lower.includes('hoodie')) {
    return 'vetements-homme';
  }
  if (lower.includes('casquette') || lower.includes('cap') || lower.includes('hat') || lower.includes('bonnet')) {
    return 'accessoires';
  }
  if (lower.includes('mug') || lower.includes('tasse') || lower.includes('bouteille') || lower.includes('bottle') || lower.includes('serviette') || lower.includes('towel') || lower.includes('bougie') || lower.includes('candle') || lower.includes('coussin') || lower.includes('pillow')) {
    return 'vie-quotidienne';
  }
  if (lower.includes('coque') || lower.includes('case') || lower.includes('bracelet') || lower.includes('autocollant') || lower.includes('sticker') || lower.includes('tote') || lower.includes('sac') || lower.includes('bag')) {
    return 'accessoires';
  }
  if (type) {
    if (type.includes('t-shirt') || type.includes('apparel')) return 'vetements-homme';
    if (type.includes('mug') || type.includes('home')) return 'vie-quotidienne';
    if (type.includes('hat') || type.includes('accessories')) return 'accessoires';
  }
  return 'accessoires';
}

// Slugify
function slugify(text) {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Couleur approximative vers hex
function colorToHex(colorName) {
  const map = {
    'white': '#FFFFFF',
    'black': '#1E293B',
    'blue': '#00D4E8',
    'navy': '#0085A1',
    'red': '#FF6B8A',
    'pink': '#FF6B8A',
    'coral': '#FF6B8A',
    'green': '#10B981',
    'yellow': '#FFD700',
    'gold': '#FFD700',
    'orange': '#F97316',
    'purple': '#8B5CF6',
    'gray': '#64748B',
    'grey': '#64748B',
  };
  return map[colorName.toLowerCase()] || '#E2E8F0';
}

// Générer le fichier products.ts
function generateProductsFile(products) {
  const productsArray = products.map((p, i) => {
    const reviewsStr = p.reviews && p.reviews.length > 0
      ? p.reviews.map(r => `      { id: "${r.id}", author: "${r.author}", rating: ${r.rating}, date: "${r.date}", text: "${r.text}" }`).join(',\n')
      : '';

    const reviewsBlock = reviewsStr ? `[
${reviewsStr}
    ]` : '[]';

    const colorsStr = p.colors.map(c => `      { name: "${c.name}", hex: "${c.hex}" }`).join(',\n');
    const sizesStr = p.sizes.map(s => `"${s}"`).join(', ');
    const detailsStr = p.details.map(d => `      "${d}"`).join(',\n');

    return `  {
    id: "${p.id}",
    slug: "${p.slug}",
    name: "${p.name}",
    price: ${p.price},
    category: "${p.category}",
    image: "${p.image}",
    badge: ${p.badge ? `"${p.badge}"` : 'undefined'},
    description: "${p.description}",
    details: [
${detailsStr}
    ],
    colors: [
${colorsStr}
    ],
    sizes: [${sizesStr}],
    reviews: ${reviewsBlock},
    inStock: ${p.inStock},
    stockCount: ${p.stockCount},
  }`;
  }).join(',\n');

  const fileContent = `export interface Product {
  id: string;
  slug: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  image: string;
  badge?: string;
  description: string;
  details: string[];
  colors: { name: string; hex: string }[];
  sizes: string[];
  reviews: Review[];
  inStock: boolean;
  stockCount?: number;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  text: string;
  avatar?: string;
}

export const categories = [
  { name: "Accessoires", count: 0, color: "bg-sm-cyan", slug: "accessoires" },
  { name: "Vêtements Femme", count: 0, color: "bg-sm-coral", slug: "vetements-femme" },
  { name: "Vêtements Homme", count: 0, color: "bg-sm-deep", slug: "vetements-homme" },
  { name: "Vie Quotidienne", count: 0, color: "bg-sm-cyan", slug: "vie-quotidienne" },
];

export const products: Product[] = [
${productsArray}
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter((p) => p.category === category);
}

export function getAllProducts(): Product[] {
  return products;
}
`;

  return fileContent;
}

// ============================================
// MAIN
// ============================================
async function main() {
  console.log('🖨️  SYNCHRONISATION PRINTFUL → #SAINTEMAXIME\n');

  const apiKey = loadEnv();
  console.log('✅ Clé API chargée');

  try {
    // 1. Récupérer les stores
    console.log('📡 Récupération des stores...');
    const stores = await printfulFetch('/stores', apiKey);
    const storeId = stores.data?.[0]?.id;

    if (!storeId) {
      console.error('❌ Aucun store Printful trouvé');
      process.exit(1);
    }
    console.log(`✅ Store trouvé : ${stores.data[0].name} (ID: ${storeId})`);

    // 2. Récupérer les produits
    console.log('📡 Récupération des produits...');
    const productsRes = await printfulFetch(`/stores/${storeId}/products`, apiKey);
    const rawProducts = productsRes.data || [];

    console.log(`✅ ${rawProducts.length} produits trouvés`);

    if (rawProducts.length === 0) {
      console.log('⚠️  Aucun produit dans le store. Ajoute des produits sur Printful d\'abord.');
      process.exit(0);
    }

    // 3. Mapper les produits
    console.log('🔄 Mapping des produits...');
    const mappedProducts = rawProducts.map((p, i) => mapPrintfulProduct(p, i));

    // 4. Générer le fichier
    console.log('📝 Génération de lib/products.ts...');
    const fileContent = generateProductsFile(mappedProducts);
    const outputPath = path.join(__dirname, '..', 'lib', 'products.ts');
    fs.writeFileSync(outputPath, fileContent, 'utf-8');

    console.log(`\n✅ FICHIER GÉNÉRÉ : ${outputPath}`);
    console.log(`   ${mappedProducts.length} produits synchronisés`);
    console.log(`\n🚀 Prochaine étape : npm run build`);

  } catch (err) {
    console.error('\n❌ ERREUR :', err.message);
    console.log('\n💡 Vérifie :');
    console.log('   - Que ta clé API est correcte');
    console.log('   - Que ton store Printful a des produits');
    console.log('   - Que tu as une connexion internet');
    process.exit(1);
  }
}

main();

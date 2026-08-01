/**
 * Migration one-shot : importe data/products.json (catégories + produits)
 * vers Supabase. À lancer une seule fois avec :
 *   node scripts/migrate-to-supabase.js
 *
 * Nécessite dans .env : NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("❌ NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY doivent être dans .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function migrate() {
  const dataPath = path.join(__dirname, "..", "data", "products.json");
  const raw = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

  console.log(`📦 ${raw.products.length} produits, ${raw.categories?.length || 0} catégories trouvées dans data/products.json`);

  // ---- Catégories ----
  if (raw.categories?.length) {
    const catRows = raw.categories.map((c, i) => ({
      name: c.name,
      slug: c.slug,
      color: c.color || "bg-sm-cyan",
      description: c.description || "",
      image: c.image || "",
      active: c.active !== false,
      sort_order: i,
    }));

    const { error: catError } = await supabase.from("categories").upsert(catRows, { onConflict: "slug" });
    if (catError) {
      console.error("❌ Erreur import catégories:", catError.message);
    } else {
      console.log(`✅ ${catRows.length} catégories importées`);
    }
  }

  // ---- Produits ----
  const prodRows = raw.products.map((p) => ({
    slug: p.slug,
    name: p.name,
    price: p.price,
    original_price: p.originalPrice ?? null,
    category: p.category,
    image: p.image || "",
    images: p.images || [],
    badge: p.badge || null,
    description: p.description || "",
    details: p.details || [],
    colors: p.colors || [],
    sizes: p.sizes || [],
    in_stock: p.inStock !== false,
    stock_count: p.stockCount || 0,
    source: p.source || "printful",
    printful_id: p.printfulId || null,
  }));

  const { error: prodError, data } = await supabase
    .from("products")
    .upsert(prodRows, { onConflict: "slug" })
    .select("id, name");

  if (prodError) {
    console.error("❌ Erreur import produits:", prodError.message);
    process.exit(1);
  }

  console.log(`✅ ${data.length} produits importés :`);
  data.forEach((p) => console.log(`   - ${p.name}`));

  // ---- Avis (reviews) s'ils existent dans le JSON ----
  let reviewCount = 0;
  for (const p of raw.products) {
    if (!p.reviews?.length) continue;
    const dbProduct = data.find((d) => d.name === p.name);
    if (!dbProduct) continue;

    const reviewRows = p.reviews.map((r) => ({
      product_id: dbProduct.id,
      author: r.author,
      rating: r.rating,
      text: r.text || "",
      avatar: r.avatar || null,
    }));

    const { error: reviewError } = await supabase.from("reviews").insert(reviewRows);
    if (!reviewError) reviewCount += reviewRows.length;
  }
  if (reviewCount) console.log(`✅ ${reviewCount} avis importés`);

  console.log("\n🎉 Migration terminée !");
}

migrate().catch((err) => {
  console.error("❌ Erreur inattendue:", err);
  process.exit(1);
});

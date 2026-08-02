import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireActiveAdmin() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false as const, status: 401, message: "Non authentifié." };

  const { data: profile } = await supabase
    .from("admin_users")
    .select("active")
    .eq("id", user.id)
    .single();

  if (!profile || !profile.active) {
    return { ok: false as const, status: 403, message: "Accès admin requis." };
  }
  return { ok: true as const };
}

function slugify(text: string) {
  return text.toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function detectCategory(name: string, type: string) {
  const lower = (name || "").toLowerCase();
  const typeLower = (type || "").toLowerCase();
  if (/(t-shirt|shirt|tee|sweat|hoodie)/.test(lower)) return "vetements-homme";
  if (/(casquette|cap|hat|bonnet)/.test(lower)) return "accessoires";
  if (/(mug|tasse|bouteille|bottle|serviette|towel|bougie|candle|coussin|pillow)/.test(lower)) return "vie-quotidienne";
  if (/(coque|case|bracelet|autocollant|sticker|tote|sac|bag)/.test(lower)) return "accessoires";
  if (/(t-shirt|apparel)/.test(typeLower)) return "vetements-homme";
  if (/(mug|home)/.test(typeLower)) return "vie-quotidienne";
  if (/(hat|accessories)/.test(typeLower)) return "accessoires";
  return "accessoires";
}

function colorToHex(colorName: string) {
  const map: Record<string, string> = {
    white: "#FFFFFF", black: "#1E293B", blue: "#00D4E8", navy: "#0085A1",
    red: "#FF6B8A", pink: "#FF6B8A", coral: "#FF6B8A", green: "#10B981",
    yellow: "#FFD700", gold: "#FFD700", orange: "#F97316", purple: "#8B5CF6",
    gray: "#64748B", grey: "#64748B",
  };
  return map[(colorName || "").toLowerCase()] || "#E2E8F0";
}

function extractVariantAttribute(variantName: string, attribute: "size" | "color") {
  const parts = String(variantName || "").split("/").map((s) => s.trim());
  if (attribute === "size") return parts.find((p) => /^(XS|S|M|L|XL|XXL|3XL|One Size|\d+(\.\d+)?(oz|cm|in))$/i.test(p)) || "";
  return parts[0] || "";
}

function imageGroupKey(url: string): string {
  try {
    const last = url.split("/").pop() || url;
    const withoutExt = last.replace(/\.[a-zA-Z0-9]+(\?.*)?$/, "");
    // Retire les suffixes de variante de résolution Printful (_preview, _thumb, _small, _medium, _large, _display)
    return withoutExt.replace(/_(preview|thumb|thumbnail|small|medium|large|display)$/i, "");
  } catch {
    return url;
  }
}

function imageQualityScore(url: string): number {
  const lower = url.toLowerCase();
  if (lower.includes("_preview") || lower.includes("_large") || lower.includes("_display")) return 3;
  if (lower.includes("_medium")) return 2;
  if (lower.includes("_thumb") || lower.includes("_small")) return 0;
  return 1; // pas de suffixe identifié : qualité neutre
}

function extractProductImages(product: any): string[] {
  const candidates: string[] = [];
  const add = (value: any) => {
    if (typeof value !== "string") return;
    const url = value.trim();
    if (!url || url.includes("product-placeholder")) return;
    candidates.push(url);
  };

  add(product.thumbnail_url);
  add(product.thumbnail);
  add(product.image);

  const variants = Array.isArray(product.variants) ? product.variants : [];
  for (const variant of variants) {
    add(variant.image);
    add(variant.thumbnail_url);
    add(variant.preview_url);
    add(variant.product?.image);
    const files = Array.isArray(variant.files) ? variant.files : [];
    for (const file of files) {
      add(file.preview_url);
      add(file.thumbnail_url);
      add(file.url);
    }
  }

  // Regroupe les URLs qui représentent la même image (juste une résolution différente)
  // et ne garde que la version la plus nette de chaque groupe, dans l'ordre de première apparition.
  const bestByGroup = new Map<string, string>();
  const groupOrder: string[] = [];
  for (const url of candidates) {
    const key = imageGroupKey(url);
    if (!bestByGroup.has(key)) {
      bestByGroup.set(key, url);
      groupOrder.push(key);
    } else if (imageQualityScore(url) > imageQualityScore(bestByGroup.get(key)!)) {
      bestByGroup.set(key, url);
    }
  }

  return groupOrder.map((key) => bestByGroup.get(key)!);
}

async function printfulFetch(endpoint: string, apiKey: string, storeId?: string | number) {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
  if (storeId) headers["X-PF-Store-Id"] = String(storeId);

  const res = await fetch(`https://api.printful.com${endpoint}`, { headers });
  const rawBody = await res.text();
  let body: any = {};
  try {
    body = rawBody ? JSON.parse(rawBody) : {};
  } catch {
    body = { raw: rawBody };
  }

  if (!res.ok) {
    const apiMessage = body?.error?.message || body?.message || body?.result || body?.raw || res.statusText;
    throw new Error(`Printful API ${res.status} sur ${endpoint} : ${apiMessage}`);
  }
  return body;
}

export async function POST() {
  const check = await requireActiveAdmin();
  if (!check.ok) {
    return NextResponse.json({ error: check.message }, { status: check.status });
  }

  const apiKey = process.env.PRINTFUL_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "PRINTFUL_API_KEY n'est pas configurée sur le serveur (variable d'environnement Vercel)." },
      { status: 400 }
    );
  }

  try {
    // API v1 : les "sync products" d'une boutique ne sont pas encore exposés en v2
    const storesRes = await printfulFetch("/stores", apiKey);
    const stores = Array.isArray(storesRes.result) ? storesRes.result : [];
    const storeId = stores[0]?.id;
    if (!storeId) throw new Error("Aucun store Printful trouvé sur ce compte.");

    const productsRes = await printfulFetch("/store/products?limit=100&offset=0", apiKey, storeId);
    const productList: any[] = Array.isArray(productsRes.result) ? productsRes.result : [];

    const admin = createAdminClient();
    const { data: existingProducts } = await admin.from("products").select("slug, printful_id, image, images, price, details");

    const results: { name: string; status: "ok" | "error"; message?: string }[] = [];

    for (const item of productList) {
      try {
        const detailRes = await printfulFetch(`/store/products/${item.id}`, apiKey, storeId);
        const detail = detailRes.result || {};
        const syncProduct = detail.sync_product || item;
        const variants = Array.isArray(detail.sync_variants) ? detail.sync_variants : [];
        const product = { ...syncProduct, variants };

        const sizes = Array.from(new Set(
          variants.map((v: any) => v.size || extractVariantAttribute(v.name, "size")).filter(Boolean)
        ));
        const colors = Array.from(new Set(
          variants.map((v: any) => v.color || extractVariantAttribute(v.name, "color")).filter(Boolean)
        )).map((c: any) => ({ name: c, hex: colorToHex(c) }));

        const category = detectCategory(product.name, product.type);

        // Prend le prix le plus bas parmi toutes les variantes (résultat stable, peu importe
        // l'ordre renvoyé par Printful) et repère s'il y a plusieurs prix différents.
        const variantPrices = variants
          .map((v: any) => parseFloat(v.retail_price ?? v.price ?? "0"))
          .filter((p: number) => p > 0);
        const minRetailPrice = variantPrices.length ? Math.min(...variantPrices) : 0;
        const maxRetailPrice = variantPrices.length ? Math.max(...variantPrices) : 0;
        const hasPriceVariations = maxRetailPrice > minRetailPrice;
        const computedPrice = Math.round(minRetailPrice * 1.5 * 100) / 100;

        const slug = slugify(product.name);
        const images = extractProductImages(product);
        const existing = (existingProducts || []).find(
          (p: any) => p.printful_id === String(product.id) || p.slug === slug
        );
        const finalImages = images.length > 0 ? images : existing?.images || [];
        const mainImage = finalImages[0] || "/images/product-placeholder.jpg";

        // Le prix n'est calculé qu'à la toute première importation.
        // Les synchros suivantes ne touchent plus au prix, pour respecter tes ajustements manuels.
        const price = existing ? undefined : computedPrice;

        let details: string[] | undefined = undefined;
        if (!existing) {
          details = [];
          if (hasPriceVariations) {
            details.push(`Prix à partir de ${(minRetailPrice * 1.5).toFixed(2)}€ selon la taille/couleur choisie.`);
          }
        }

        const { error: upsertError } = await admin.from("products").upsert(
          {
            slug,
            name: product.name,
            price,
            category,
            image: mainImage,
            images: finalImages,
            colors: colors.length ? colors : [{ name: "Blanc", hex: "#FFFFFF" }],
            sizes: sizes.length ? sizes : ["One Size"],
            in_stock: true,
            source: "printful",
            printful_id: String(product.id),
            description: existing ? undefined : `${product.name} — Produit officiel #SAINTEMAXIME.`,
            details,
          },
          { onConflict: "slug" }
        );

        if (upsertError) throw new Error(upsertError.message);
        results.push({ name: product.name, status: "ok" });
      } catch (err: any) {
        results.push({ name: item.name || item.id, status: "error", message: err.message });
      }
    }

    const okCount = results.filter((r) => r.status === "ok").length;
    return NextResponse.json({ total: productList.length, synced: okCount, results });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Erreur inattendue." }, { status: 500 });
  }
}

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

function extractProductImages(product: any): string[] {
  const urls: string[] = [];
  const add = (value: any) => {
    if (typeof value !== "string") return;
    const url = value.trim();
    if (!url || url.includes("product-placeholder")) return;
    if (!urls.includes(url)) urls.push(url);
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
  return urls;
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
    const storesRes = await fetch("https://api.printful.com/v2/stores", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!storesRes.ok) {
      const body = await storesRes.text();
      throw new Error(`Printful /stores a répondu ${storesRes.status} : ${body.slice(0, 300)}`);
    }
    const storesData = await storesRes.json();
    const storeId = storesData.data?.[0]?.id;
    if (!storeId) throw new Error("Aucun store Printful trouvé sur ce compte.");

    const listRes = await fetch(`https://api.printful.com/v2/stores/${storeId}/products?limit=100`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!listRes.ok) {
      const body = await listRes.text();
      throw new Error(`Printful /products a répondu ${listRes.status} : ${body.slice(0, 300)}`);
    }
    const listData = await listRes.json();
    const productList: any[] = listData.data || [];

    const admin = createAdminClient();
    const { data: existingProducts } = await admin.from("products").select("slug, printful_id, image, images");

    const results: { name: string; status: "ok" | "error"; message?: string }[] = [];

    for (const item of productList) {
      try {
        // Le listing ne contient pas toutes les variantes : on va chercher la fiche complète
        const detailRes = await fetch(`https://api.printful.com/v2/stores/${storeId}/products/${item.id}`, {
          headers: { Authorization: `Bearer ${apiKey}` },
        });
        if (!detailRes.ok) {
          const body = await detailRes.text();
          throw new Error(`Détail produit ${item.id} : ${detailRes.status} ${body.slice(0, 200)}`);
        }
        const detail = (await detailRes.json()).data;

        const variants = Array.isArray(detail.sync_variants) ? detail.sync_variants : [];
        const product = { ...detail, variants };

        const sizes = Array.from(new Set(
          variants.map((v: any) => v.size || extractVariantAttribute(v.name, "size")).filter(Boolean)
        ));
        const colors = Array.from(new Set(
          variants.map((v: any) => v.color || extractVariantAttribute(v.name, "color")).filter(Boolean)
        )).map((c: any) => ({ name: c, hex: colorToHex(c) }));

        const category = detectCategory(product.name, product.type);
        const retailPrice = variants[0]?.retail_price || variants[0]?.price || 0;
        const price = Math.round(parseFloat(retailPrice) * 1.5);
        const slug = slugify(product.name);
        const images = extractProductImages(product);
        const existing = (existingProducts || []).find(
          (p: any) => p.printful_id === String(product.id) || p.slug === slug
        );
        const finalImages = images.length > 0 ? images : existing?.images || [];
        const mainImage = finalImages[0] || "/images/product-placeholder.jpg";

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

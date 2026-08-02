import { createClient } from "@/lib/supabase/server";

export interface Product {
  id: string;
  slug: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  categories: string[];
  image: string;
  images?: string[];
  badge?: string;
  description: string;
  details: string[];
  colors: { name: string; hex: string }[];
  sizes: string[];
  reviews: Review[];
  inStock: boolean;
  stockCount?: number;
  source?: "printful" | "manual";
  printfulId?: string;
  lastSyncedAt?: string;
  viewCount?: number;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  text: string;
  avatar?: string;
}

export interface Category {
  name: string;
  slug: string;
  color: string;
  count: number;
  description: string;
  image: string;
  active: boolean;
}

function mapProductRow(row: any, reviews: Review[] = []): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    price: Number(row.price),
    originalPrice: row.original_price != null ? Number(row.original_price) : undefined,
    category: row.category,
    categories: Array.isArray(row.categories) && row.categories.length ? row.categories : [row.category].filter(Boolean),
    image: row.image || "",
    images: row.images || [],
    badge: row.badge || undefined,
    description: row.description || "",
    details: row.details || [],
    colors: row.colors || [],
    sizes: row.sizes || [],
    reviews,
    inStock: row.in_stock,
    stockCount: row.stock_count || 0,
    source: row.source,
    printfulId: row.printful_id || undefined,
    lastSyncedAt: row.last_synced_at || undefined,
    viewCount: row.view_count || 0,
  };
}

function mapCategoryRow(row: any, count: number): Category {
  return {
    name: row.name,
    slug: row.slug,
    color: row.color,
    count,
    description: row.description || "",
    image: row.image || "",
    active: row.active,
  };
}

// -------- Site public (lecture seule, respecte RLS) --------

export async function getAllProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
  return (data || []).map((row) => mapProductRow(row));
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const [{ data: cats }, { data: prods }] = await Promise.all([
    supabase.from("categories").select("*").eq("active", true).order("sort_order", { ascending: true }),
    supabase.from("products").select("category, categories"),
  ]);
  const counts: Record<string, number> = {};
  (prods || []).forEach((p: any) => {
    const list: string[] = Array.isArray(p.categories) && p.categories.length ? p.categories : [p.category].filter(Boolean);
    list.forEach((slug) => {
      counts[slug] = (counts[slug] || 0) + 1;
    });
  });
  return (cats || []).map((row) => mapCategoryRow(row, counts[row.slug] || 0));
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const supabase = await createClient();
  const { data: product } = await supabase.from("products").select("*").eq("slug", slug).single();
  if (!product) return undefined;

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*")
    .eq("product_id", product.id)
    .order("created_at", { ascending: false });

  const mappedReviews: Review[] = (reviews || []).map((r: any) => ({
    id: r.id,
    author: r.author,
    rating: r.rating,
    date: r.created_at,
    text: r.text || "",
    avatar: r.avatar || undefined,
  }));

  return mapProductRow(product, mappedReviews);
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("products").select("*").contains("categories", [category]);
  return (data || []).map((row) => mapProductRow(row));
}

export async function getProductsByBadge(badge: string): Promise<Product[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("products").select("*").ilike("badge", `%${badge}%`);
  return (data || []).map((row) => mapProductRow(row));
}

export async function getBestsellers(): Promise<Product[]> {
  return getProductsByBadge("best");
}

export async function getNewArrivals(): Promise<Product[]> {
  return getProductsByBadge("nouveau");
}

export async function incrementProductViews(productId: string): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase.rpc("increment_product_views", { p_product_id: productId });
  } catch {
    // Ne bloque jamais l'affichage de la page si l'incrément échoue
  }
}

export async function getAllProductSlugs(): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("products").select("slug");
  return (data || []).map((p: any) => p.slug);
}

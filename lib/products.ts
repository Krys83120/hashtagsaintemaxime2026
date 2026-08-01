export interface Product {
  id: string;
  slug: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
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
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  text: string;
  avatar?: string;
}

// Import depuis le JSON généré par le script de sync
import productsData from "../data/products.json";

export const categories = productsData.categories;
export const products: Product[] = productsData.products as Product[];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter((p) => p.category === category);
}

export function getAllProducts(): Product[] {
  return products;
}

export function getProductsByBadge(badge: string): Product[] {
  return products.filter((p) => p.badge?.toLowerCase() === badge.toLowerCase());
}

export function getBestsellers(): Product[] {
  return products.filter((p) => p.badge?.toLowerCase().includes("best"));
}

export function getNewArrivals(): Product[] {
  return products.filter((p) => p.badge?.toLowerCase().includes("nouveau"));
}

import "server-only";

export interface GoogleReview {
  id: string;
  author: string;
  authorPhoto?: string;
  rating: number;
  text: string;
  relativeTime: string;
  publishTime: string;
  source: string;
}

// Fiches Google identifiées : la boutique #SAINTEMAXIME et le hashtag géant (attraction touristique)
const PLACE_IDS: { id: string; source: string }[] = [
  { id: "ChIJGxEXB8a5zhIRrPFwP4HduvQ", source: "Boutique #SAINTEMAXIME" },
  { id: "ChIJn7oJjH-5zhIRQbHkI4E8YJ0", source: "Le Hashtag Géant" },
];

async function fetchPlaceReviews(placeId: string, source: string): Promise<GoogleReview[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return [];

  try {
    const res = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "reviews,rating,userRatingCount",
      },
      next: { revalidate: 3600 * 12 }, // rafraîchi 2x/jour
    });

    if (!res.ok) return [];
    const data = await res.json();
    const reviews = data.reviews || [];

    return reviews.map((r: any) => ({
      id: `${placeId}-${r.publishTime}`,
      author: r.authorAttribution?.displayName || "Client Google",
      authorPhoto: r.authorAttribution?.photoUri,
      rating: r.rating,
      text: r.originalText?.text || r.text?.text || "",
      relativeTime: r.relativePublishTimeDescription || "",
      publishTime: r.publishTime,
      source,
    }));
  } catch {
    return [];
  }
}

export async function getMergedGoogleReviews(): Promise<GoogleReview[]> {
  const results = await Promise.all(PLACE_IDS.map((p) => fetchPlaceReviews(p.id, p.source)));
  const merged = results.flat();

  // Tri du plus récent au plus ancien
  return merged.sort((a, b) => new Date(b.publishTime).getTime() - new Date(a.publishTime).getTime());
}

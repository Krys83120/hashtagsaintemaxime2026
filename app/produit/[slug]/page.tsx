import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Star, Truck, RefreshCw, ShieldCheck } from "lucide-react";

import Reviews from "@/components/Reviews";
import ProductGallery from "@/components/ProductGallery";
import AddToCart from "@/components/AddToCart";
import { getProductBySlug, getAllProducts } from "@/lib/products";
import { averageRating, formatPrice } from "@/lib/utils";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    return { title: "Produit non trouvé" };
  }

  return {
    title: `${product.name} | Boutique Officielle #SAINTEMAXIME | Été 2026`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.image ? [{ url: product.image }] : [],
      type: "website",
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  const avgRating = averageRating(product.reviews);

  const allProducts = await getAllProducts();
  const crossSell = allProducts
    .filter((item) => item.id !== product.id)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-sm-cream border-b border-sm-lightgray py-3 px-4">
        <div className="max-w-7xl mx-auto text-sm text-sm-gray">
          <Link href="/" className="hover:text-sm-cyan transition-colors">
            Accueil
          </Link>

          <span className="mx-2">/</span>

          <Link
            href="/boutique/"
            className="hover:text-sm-cyan transition-colors"
          >
            Boutique
          </Link>

          <span className="mx-2">/</span>
          <span className="text-sm-dark font-medium">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Images */}
          <ProductGallery
            name={product.name}
            image={product.image}
            images={product.images}
            badge={product.badge}
          />

          {/* Info */}
          <div className="space-y-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-sm-dark">
              {product.name}
            </h1>

            <div className="flex items-center gap-3">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.round(avgRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-sm-lightgray"
                    }`}
                  />
                ))}
              </div>

              <span className="text-sm-gray text-sm">
                {avgRating > 0 ? `${avgRating}/5` : "Pas encore d'avis"}
              </span>

              {product.reviews.length > 0 && (
                <span className="text-sm-cyan text-sm underline">
                  ({product.reviews.length} avis)
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-sm-cyan">
                {formatPrice(product.price)}
              </span>

              {product.originalPrice && (
                <span className="text-lg text-sm-gray line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            {product.stockCount && product.stockCount <= 5 && (
              <p className="text-sm-coral font-semibold text-sm">
                ⚡ Plus que {product.stockCount} en stock !
              </p>
            )}

            <p className="text-sm-dark leading-relaxed">
              {product.description}
            </p>

            <AddToCart product={product} />

            <div className="flex flex-wrap gap-4 text-sm text-sm-gray pt-4 border-t border-sm-lightgray">
              <span className="flex items-center gap-1">
                <Truck className="w-4 h-4" />
                Livraison 3-5 jours
              </span>

              <span className="flex items-center gap-1">
                <RefreshCw className="w-4 h-4" />
                Retours 30 jours
              </span>

              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" />
                Paiement sécurisé
              </span>
            </div>

            <div className="pt-6 space-y-4">
              <h3 className="font-bold text-lg text-sm-dark">
                Détails du produit
              </h3>

              <ul className="space-y-2">
                {product.details.map((detail, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-sm-dark"
                  >
                    <span className="text-sm-cyan mt-0.5">✓</span>
                    {detail}
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-6 border-t border-sm-lightgray">
              <h3 className="font-bold text-lg text-sm-dark mb-4">
                Avis Clients
              </h3>
              <Reviews reviews={product.reviews} />
            </div>
          </div>
        </div>

        {/* Cross-sell */}
        <div className="mt-20 pt-12 border-t border-sm-lightgray">
          <h2 className="text-2xl font-bold text-sm-deep mb-8">
            Complète ton look d'été
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {crossSell.map((item) => (
              <Link
                key={item.id}
                href={`/produit/${item.slug}/`}
                className="block"
              >
                <div className="bg-sm-cream rounded-xl p-4 border border-sm-lightgray hover:border-sm-cyan transition-colors">
                  <div className="aspect-square bg-white rounded-lg overflow-hidden flex items-center justify-center mb-4">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-sm-cyan/20 flex items-center justify-center text-sm-cyan text-2xl font-bold">
                        #
                      </div>
                    )}
                  </div>

                  <h4 className="font-semibold text-sm-dark">{item.name}</h4>
                  <p className="text-sm-cyan font-bold">
                    {formatPrice(item.price)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

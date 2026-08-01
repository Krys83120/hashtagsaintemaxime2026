"use client";

import { useMemo, useState } from "react";

interface ProductGalleryProps {
  name: string;
  image?: string;
  images?: string[];
  badge?: string;
}

export default function ProductGallery({
  name,
  image,
  images = [],
  badge,
}: ProductGalleryProps) {
  const gallery = useMemo(() => {
    const urls = [image, ...images].filter(
      (url): url is string => Boolean(url && !url.includes("product-placeholder"))
    );

    return Array.from(new Set(urls));
  }, [image, images]);

  const [selectedImage, setSelectedImage] = useState(gallery[0] ?? image ?? "");

  return (
    <div className="space-y-4">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-white border border-sm-lightgray">
        {selectedImage ? (
          <img
            src={selectedImage}
            alt={name}
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sm-cyan/10 to-sm-coral/10">
            <span className="text-6xl font-bold text-sm-cyan">#</span>
          </div>
        )}

        {badge && (
          <span className="absolute top-4 left-4 bg-sm-coral text-white text-xs font-bold px-3 py-1.5 rounded-full">
            {badge}
          </span>
        )}
      </div>

      {gallery.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {gallery.slice(0, 8).map((url, index) => (
            <button
              key={url}
              type="button"
              onClick={() => setSelectedImage(url)}
              className={`aspect-square overflow-hidden rounded-xl bg-white border-2 transition-colors ${
                selectedImage === url
                  ? "border-sm-cyan"
                  : "border-sm-lightgray hover:border-sm-cyan/60"
              }`}
              aria-label={`Afficher la vue ${index + 1} de ${name}`}
            >
              <img
                src={url}
                alt={`${name} - vue ${index + 1}`}
                className="h-full w-full object-contain"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

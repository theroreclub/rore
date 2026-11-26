"use client";

import { useState } from "react";
import Image from "next/image";

interface ProductGalleryProps {
  images: string[];
  name: string;
}

export function ProductGallery({ images, name }: ProductGalleryProps) {
  const displayImages = images.length > 0 ? images : ["/images/products/vintage-boxy-tee.svg"];
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <div className="space-y-4">
      <div className="relative aspect-square w-full overflow-hidden border bg-zinc-900">
        <Image
          src={displayImages[selectedIndex] || displayImages[0]}
          alt={name}
          fill
          preload
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover object-center transition-all duration-500 ease-out"
        />

      </div>

      {/* Thumbnails (if multiple images exist) */}
      {displayImages.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
          {displayImages.map((img, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <button
                type="button"
                key={img + idx}
                aria-pressed={isSelected}
                aria-label={`View product image ${idx + 1}`}
                onClick={() => setSelectedIndex(idx)}
                className={`relative aspect-[4/5] w-20 rounded-xl overflow-hidden transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "ring-2 ring-accent ring-offset-2 ring-offset-black scale-105"
                    : "glass opacity-70 hover:opacity-100"
                }`}
              >
                <Image
                  src={img}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

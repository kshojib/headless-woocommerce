"use client";

import { useState } from "react";
import Image from "next/image";

interface ProductImage {
  sourceUrl: string;
  altText?: string;
}

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-lg bg-gray-200">
        <span className="text-gray-400">No Image Available</span>
      </div>
    );
  }

  const selectedImage = images[selectedImageIndex];

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
        <Image
          src={selectedImage.sourceUrl}
          alt={selectedImage.altText || productName}
          fill
          className="object-cover transition-opacity duration-300"
          priority={selectedImageIndex === 0}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
        />
      </div>

      {/* Thumbnail Gallery */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-4">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImageIndex(index)}
              className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                selectedImageIndex === index
                  ? "border-primary-600 ring-2 ring-primary-600 ring-offset-2"
                  : "border-gray-200 hover:border-gray-400"
              }`}
            >
              <Image
                src={image.sourceUrl}
                alt={image.altText || `${productName} ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 25vw, 150px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Image Counter */}
      {images.length > 1 && (
        <div className="text-center text-sm text-gray-600">
          {selectedImageIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );
}

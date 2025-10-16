"use client";

import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import toast from "react-hot-toast";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();

    // Don't add external products to cart
    if (product.externalUrl) {
      return;
    }

    addItem(product, 1);
    toast.success(`${product.name} added to cart!`);
  };

  // Check if product is in stock (external products are always "available")
  const isInStock = product.externalUrl || product.stockStatus === "IN_STOCK";
  const isExternal = !!product.externalUrl;

  return (
    <Link href={`/product/${product.slug}`}>
      <div className="card group h-full">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden rounded-lg">
          {product.image ? (
            <Image
              src={product.image.sourceUrl}
              alt={product.image.altText || product.name}
              fill
              className="object-cover transition duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gray-200">
              <span className="text-gray-400">No Image</span>
            </div>
          )}
          {product.onSale && (
            <span className="absolute left-2 top-2 rounded bg-red-500 px-2 py-1 text-xs font-semibold text-white">
              Sale
            </span>
          )}
        </div>

        {/* Product Info */}
        <div className="mt-4">
          <h3 className="line-clamp-2 font-semibold group-hover:text-primary-600">
            {product.name}
          </h3>

          {/* Price */}
          <div className="mt-2 flex items-center gap-2">
            {product.onSale && product.regularPrice ? (
              <>
                <span className="text-lg font-bold text-primary-600">
                  {formatPrice(product.salePrice || product.price || "0")}
                </span>
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(product.regularPrice)}
                </span>
              </>
            ) : (
              <span className="text-lg font-bold">
                {formatPrice(product.price || "0")}
              </span>
            )}
          </div>

          {/* Rating - only show if there are reviews */}
          {product.averageRating &&
            product.averageRating > 0 &&
            product.reviewCount &&
            product.reviewCount > 0 && (
              <div className="mt-2 flex items-center gap-1">
                <span className="text-yellow-400">★</span>
                <span className="text-sm text-gray-600">
                  {product.averageRating} ({product.reviewCount})
                </span>
              </div>
            )}
        </div>

        {/* Add to Cart Button */}
        {isExternal ? (
          <a
            href={product.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="btn-primary mt-4 w-full text-center block truncate"
            title={product.buttonText || "Buy Now"}
          >
            {product.buttonText && product.buttonText.length > 20
              ? "Buy Now"
              : product.buttonText || "Buy Now"}
          </a>
        ) : (
          <button
            onClick={handleAddToCart}
            className="btn-primary mt-4 w-full"
            disabled={!isInStock}
          >
            {isInStock ? "Add to Cart" : "Out of Stock"}
          </button>
        )}
      </div>
    </Link>
  );
}

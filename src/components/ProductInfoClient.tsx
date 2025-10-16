"use client";

import { useState } from "react";
import { Product, ProductVariation } from "@/types";
import { formatPrice } from "@/lib/utils";
import { AddToCartButton } from "@/components/AddToCartButton";
import { ProductVariations } from "@/components/ProductVariations";

interface ProductInfoClientProps {
  product: Product;
}

export function ProductInfoClient({ product }: ProductInfoClientProps) {
  const [selectedVariation, setSelectedVariation] =
    useState<ProductVariation | null>(null);

  const hasVariations =
    product.variations && product.variations.nodes.length > 0;

  // Use variation data if selected, otherwise use product data
  const displayPrice = selectedVariation?.price || product.price;
  const displayRegularPrice =
    selectedVariation?.regularPrice || product.regularPrice;
  const displaySalePrice = selectedVariation?.salePrice || product.salePrice;
  const displayOnSale = selectedVariation
    ? selectedVariation.salePrice && selectedVariation.regularPrice
    : product.onSale;
  const displayStockStatus =
    selectedVariation?.stockStatus || product.stockStatus;

  return (
    <>
      {/* Price */}
      <div className="mt-6">
        {displayOnSale && displayRegularPrice ? (
          <div className="flex items-center gap-4">
            <span className="text-3xl font-bold text-primary-600">
              {formatPrice(displaySalePrice || displayPrice || "0")}
            </span>
            <span className="text-xl text-gray-500 line-through">
              {formatPrice(displayRegularPrice)}
            </span>
            <span className="rounded bg-red-500 px-3 py-1 text-sm font-semibold text-white">
              Save{" "}
              {Math.round(
                ((parseFloat(displayRegularPrice) -
                  parseFloat(displaySalePrice || displayPrice || "0")) /
                  parseFloat(displayRegularPrice)) *
                  100
              )}
              %
            </span>
          </div>
        ) : (
          <span className="text-3xl font-bold">
            {formatPrice(displayPrice || "0")}
          </span>
        )}
      </div>

      {/* Stock Status */}
      <div className="mt-4">
        {product.externalUrl ? (
          <span className="text-blue-600">External Product</span>
        ) : displayStockStatus === "IN_STOCK" ? (
          <span className="text-green-600">✓ In Stock</span>
        ) : (
          <span className="text-red-600">✗ Out of Stock</span>
        )}
      </div>

      {/* Short Description */}
      {product.shortDescription && (
        <div
          className="prose mt-6 max-w-none"
          dangerouslySetInnerHTML={{ __html: product.shortDescription }}
        />
      )}

      {/* Variations */}
      {hasVariations && (
        <div className="mt-8">
          <ProductVariations
            product={product}
            onVariationChange={setSelectedVariation}
          />
        </div>
      )}

      {/* Add to Cart */}
      <div className="mt-8">
        <AddToCartButton product={product} variation={selectedVariation} />
      </div>

      {/* Product Details */}
      {product.description && (
        <div className="mt-12">
          <h2 className="mb-4 text-2xl font-semibold">Product Details</h2>
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        </div>
      )}
    </>
  );
}

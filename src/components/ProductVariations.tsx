"use client";

import { useState } from "react";
import { Product, ProductVariation } from "@/types";
import { formatPrice } from "@/lib/utils";

interface ProductVariationsProps {
  product: Product;
  onVariationChange?: (variation: ProductVariation | null) => void;
}

// Helper function to normalize attribute names for comparison
const normalizeAttributeName = (name: string): string => {
  // Convert to lowercase and remove 'pa_' prefix if present
  return name.toLowerCase().replace(/^pa_/, "");
};

// Helper function to format attribute names for display
const formatAttributeName = (name: string): string => {
  // Remove 'pa_' prefix if present
  const cleanName = name.replace(/^pa_/, "");
  // Capitalize first letter of each word
  return cleanName
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export function ProductVariations({
  product,
  onVariationChange,
}: ProductVariationsProps) {
  const [selectedAttributes, setSelectedAttributes] = useState<
    Record<string, string>
  >({});

  if (!product.variations || product.variations.nodes.length === 0) {
    return null;
  }

  // Extract unique attributes from product-level attributes (for variable products)
  const attributeMap = new Map<string, Set<string>>();

  // First, try to get attributes from the product level (VariableProduct.attributes)
  if (product.attributes?.nodes) {
    product.attributes.nodes.forEach((attr) => {
      if (attr.variation && attr.options) {
        const normalizedName = normalizeAttributeName(attr.name);
        attributeMap.set(normalizedName, new Set(attr.options));
      }
    });
  }

  // If no product-level attributes, fall back to extracting from variations
  if (attributeMap.size === 0) {
    product.variations.nodes.forEach((variation) => {
      variation.attributes?.nodes.forEach((attr) => {
        const normalizedName = normalizeAttributeName(attr.name);
        if (!attributeMap.has(normalizedName)) {
          attributeMap.set(normalizedName, new Set());
        }
        // Only add non-empty values
        if (attr.value) {
          attributeMap.get(normalizedName)?.add(attr.value);
        }
      });
    });
  }

  // Find matching variation based on selected attributes
  const findMatchingVariation = (attrs: Record<string, string>) => {
    // Check if all required attributes are selected
    const allSelected = Array.from(attributeMap.keys()).every(
      (key) => attrs[key]
    );

    if (!allSelected) {
      return null;
    }

    // Find variation that matches selected attributes
    const matchingVariation = product.variations?.nodes.find((variation) => {
      // Check if this variation matches all selected attributes
      return variation.attributes?.nodes.every((attr) => {
        const normalizedName = normalizeAttributeName(attr.name);
        // If attr.value is empty, it means "Any" - any value is acceptable
        // If attr.value has a value, it must match the selected value
        return !attr.value || attrs[normalizedName] === attr.value;
      });
    });

    // If no specific match found and all variations have empty attribute values,
    // it means any combination is valid, so return the first available variation
    if (
      !matchingVariation &&
      product.variations &&
      product.variations.nodes.length > 0
    ) {
      const hasEmptyAttributes =
        product.variations.nodes[0].attributes?.nodes.every(
          (attr) => !attr.value || attr.value === ""
        );
      if (hasEmptyAttributes) {
        return product.variations.nodes[0];
      }
    }

    return matchingVariation || null;
  };

  const handleAttributeChange = (attributeName: string, value: string) => {
    const newAttributes = {
      ...selectedAttributes,
      [attributeName]: value,
    };
    setSelectedAttributes(newAttributes);

    // Check if all attributes are selected
    const allSelected = Array.from(attributeMap.keys()).every(
      (key) => newAttributes[key]
    );

    if (allSelected) {
      const matchingVariation = findMatchingVariation(newAttributes);
      onVariationChange?.(matchingVariation || null);
    } else {
      onVariationChange?.(null);
    }
  };

  const selectedVariation = findMatchingVariation(selectedAttributes);

  return (
    <div className="space-y-4">
      {Array.from(attributeMap.entries()).map(([attributeName, values]) => {
        const displayName = formatAttributeName(attributeName);
        return (
          <div key={attributeName}>
            <label className="mb-2 block font-semibold">{displayName}</label>
            <div className="flex flex-wrap gap-2">
              {Array.from(values).map((value) => {
                const isSelected = selectedAttributes[attributeName] === value;

                // All options from product.attributes are available
                // We only disable based on stock status after selection, not on attribute availability
                const isAvailable = true;

                return (
                  <button
                    key={value}
                    onClick={() => handleAttributeChange(attributeName, value)}
                    disabled={!isAvailable}
                    className={`rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all ${
                      isSelected
                        ? "border-primary-600 bg-primary-600 text-white"
                        : isAvailable
                        ? "border-gray-300 hover:border-primary-600"
                        : "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400 line-through"
                    }`}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Show selected variation info */}
      {selectedVariation && (
        <div className="rounded-lg bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Selected Variation:</p>
              <p className="text-sm text-gray-600">{selectedVariation.name}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary-600">
                {formatPrice(selectedVariation.price || "0")}
              </p>
              {selectedVariation.stockStatus === "IN_STOCK" ? (
                <p className="text-sm text-green-600">✓ In Stock</p>
              ) : (
                <p className="text-sm text-red-600">✗ Out of Stock</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Show message if not all attributes selected */}
      {!selectedVariation &&
        Object.keys(selectedAttributes).length > 0 &&
        Object.keys(selectedAttributes).length < attributeMap.size && (
          <p className="text-sm text-gray-600">
            Please select all options to see availability
          </p>
        )}
    </div>
  );
}

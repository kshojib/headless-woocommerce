"use client";

import { useState } from "react";
import { Product, ProductVariation } from "@/types";
import { useCartStore } from "@/store/cart-store";
import toast from "react-hot-toast";

interface AddToCartButtonProps {
  product: Product;
  variation?: ProductVariation | null;
}

export function AddToCartButton({ product, variation }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    // Check stock status from variation if available, otherwise from product
    const stockStatus = variation?.stockStatus || product.stockStatus;

    if (stockStatus !== "IN_STOCK") {
      toast.error("Product is out of stock");
      return;
    }

    // Check if variable product but no variation selected
    if (
      product.variations &&
      product.variations.nodes.length > 0 &&
      !variation
    ) {
      toast.error("Please select product options");
      return;
    }

    addItem(product, quantity, variation || undefined);

    const itemName = variation
      ? `${product.name} - ${variation.name}`
      : product.name;
    toast.success(`Added ${quantity} ${itemName} to cart!`);
    setQuantity(1);
  };

  // If it's an external product, show a "Buy Now" button linking to external URL
  if (product.externalUrl) {
    return (
      <a
        href={product.externalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary block text-center"
      >
        {product.buttonText || "Buy Now"}
      </a>
    );
  }

  return (
    <div className="flex items-center gap-4">
      {/* Quantity Selector */}
      <div className="flex items-center gap-2">
        <label htmlFor="quantity" className="font-semibold">
          Quantity:
        </label>
        <div className="flex items-center">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="flex h-10 w-10 items-center justify-center rounded-l border hover:bg-gray-100"
          >
            -
          </button>
          <input
            id="quantity"
            type="number"
            min="1"
            value={quantity}
            onChange={(e) =>
              setQuantity(Math.max(1, parseInt(e.target.value) || 1))
            }
            className="h-10 w-16 border-y text-center focus:outline-none"
          />
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="flex h-10 w-10 items-center justify-center rounded-r border hover:bg-gray-100"
          >
            +
          </button>
        </div>
      </div>

      {/* Add to Cart Button */}
      <button
        onClick={handleAddToCart}
        disabled={
          (variation?.stockStatus || product.stockStatus) !== "IN_STOCK"
        }
        className="btn-primary flex-1"
      >
        {(variation?.stockStatus || product.stockStatus) === "IN_STOCK"
          ? "Add to Cart"
          : "Out of Stock"}
      </button>
    </div>
  );
}

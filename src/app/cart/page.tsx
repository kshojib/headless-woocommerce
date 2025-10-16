"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart-store";
import { formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";

export default function CartPage() {
  const router = useRouter();
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
  } = useCartStore();
  const [isClearing, setIsClearing] = useState(false);

  const handleClearCart = () => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      setIsClearing(true);
      clearCart();
      toast.success("Cart cleared");
      setTimeout(() => setIsClearing(false), 500);
    }
  };

  const handleCheckout = () => {
    router.push("/checkout");
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-6">
            <svg
              className="mx-auto h-32 w-32 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </div>
          <h1 className="mb-4 text-3xl font-bold">Your Cart is Empty</h1>
          <p className="mb-8 text-gray-600">
            Looks like you haven't added any items to your cart yet.
          </p>
          <Link href="/products" className="btn-primary">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Shopping Cart</h1>
        <button
          onClick={handleClearCart}
          disabled={isClearing}
          className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {items.map((item) => {
              const itemKey = `${item.product.id}-${
                item.variation?.id || "no-variation"
              }`;
              return (
                <div key={itemKey} className="card flex gap-4">
                  {/* Product Image */}
                  <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg">
                    {item.product.image ? (
                      <Image
                        src={item.product.image.sourceUrl}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gray-200">
                        <span className="text-xs text-gray-400">No Image</span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <Link
                        href={`/product/${item.product.slug}`}
                        className="font-semibold hover:text-primary-600"
                      >
                        {item.product.name}
                      </Link>
                      <p className="mt-1 text-sm text-gray-600">
                        {formatPrice(
                          item.variation?.price || item.product.price || "0"
                        )}{" "}
                        each
                      </p>
                      {item.variation && (
                        <p className="mt-1 text-xs text-gray-500">
                          Variation: {item.variation.name}
                        </p>
                      )}
                    </div>

                    {/* Quantity Controls */}
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              Math.max(1, item.quantity - 1),
                              item.variation?.id
                            )
                          }
                          className="flex h-8 w-8 items-center justify-center rounded border hover:bg-gray-100"
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="w-12 text-center font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              item.quantity + 1,
                              item.variation?.id
                            )
                          }
                          className="flex h-8 w-8 items-center justify-center rounded border hover:bg-gray-100"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      {/* Item Total */}
                      <div className="flex items-center gap-4">
                        <p className="text-lg font-semibold">
                          {formatPrice(
                            parseFloat(
                              item.variation?.price || item.product.price || "0"
                            ) * item.quantity
                          )}
                        </p>
                        <button
                          onClick={() => {
                            removeItem(item.product.id, item.variation?.id);
                            toast.success("Item removed from cart");
                          }}
                          className="text-red-500 hover:text-red-700"
                          aria-label="Remove item"
                        >
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Continue Shopping */}
          <div className="mt-6">
            <Link
              href="/products"
              className="inline-flex items-center text-primary-600 hover:text-primary-700"
            >
              <svg
                className="mr-2 h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card sticky top-24">
            <h2 className="mb-4 text-xl font-semibold">Order Summary</h2>

            <div className="space-y-3 border-b pb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Items ({getCartCount()})</span>
                <span className="font-medium">
                  {formatPrice(getCartTotal())}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">Calculated at checkout</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">Calculated at checkout</span>
              </div>
            </div>

            <div className="mt-4 flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>{formatPrice(getCartTotal())}</span>
            </div>

            <button
              onClick={handleCheckout}
              className="btn-primary mt-6 w-full"
            >
              Proceed to Checkout
            </button>

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                Secure checkout powered by Stripe
              </p>
            </div>

            {/* Trust Badges */}
            <div className="mt-6 space-y-2 border-t pt-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg
                  className="h-5 w-5 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Free shipping on orders over $50
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg
                  className="h-5 w-5 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Secure payment processing
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg
                  className="h-5 w-5 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                30-day return policy
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

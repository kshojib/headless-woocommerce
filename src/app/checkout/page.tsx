"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCartStore } from "@/store/cart-store";
import { useAuthStore } from "@/store/auth-store";
import { formatPrice } from "@/lib/utils";
import { loadStripe } from "@stripe/stripe-js";
import toast from "react-hot-toast";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getCartTotal, clearCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const [billingInfo, setBillingInfo] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: "",
    address1: user?.billing?.address1 || "",
    address2: user?.billing?.address2 || "",
    city: user?.billing?.city || "",
    state: user?.billing?.state || "",
    postcode: user?.billing?.postcode || "",
    country: user?.billing?.country || "US",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBillingInfo({
      ...billingInfo,
      [e.target.name]: e.target.value,
    });
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Create Stripe checkout session
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          customerEmail: billingInfo.email,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      if (!stripe) throw new Error("Stripe failed to load");

      const { error } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast.error(error.message || "Failed to process checkout");
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="mb-4 text-3xl font-bold">Your Cart is Empty</h1>
        <p className="mb-8 text-gray-600">
          Add some products to your cart before checking out.
        </p>
        <Link href="/products" className="btn-primary">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Checkout</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Billing Information Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleCheckout} className="space-y-6">
            <div className="card">
              <h2 className="mb-4 text-xl font-semibold">
                Billing Information
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className="mb-1 block font-medium">
                    First Name *
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={billingInfo.firstName}
                    onChange={handleInputChange}
                    className="input"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="mb-1 block font-medium">
                    Last Name *
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={billingInfo.lastName}
                    onChange={handleInputChange}
                    className="input"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor="email" className="mb-1 block font-medium">
                  Email Address *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={billingInfo.email}
                  onChange={handleInputChange}
                  className="input"
                />
              </div>

              <div className="mt-4">
                <label htmlFor="phone" className="mb-1 block font-medium">
                  Phone Number *
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={billingInfo.phone}
                  onChange={handleInputChange}
                  className="input"
                />
              </div>

              <div className="mt-4">
                <label htmlFor="address1" className="mb-1 block font-medium">
                  Street Address *
                </label>
                <input
                  id="address1"
                  name="address1"
                  type="text"
                  required
                  value={billingInfo.address1}
                  onChange={handleInputChange}
                  className="input"
                />
              </div>

              <div className="mt-4">
                <label htmlFor="address2" className="mb-1 block font-medium">
                  Apartment, Suite, etc. (Optional)
                </label>
                <input
                  id="address2"
                  name="address2"
                  type="text"
                  value={billingInfo.address2}
                  onChange={handleInputChange}
                  className="input"
                />
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div>
                  <label htmlFor="city" className="mb-1 block font-medium">
                    City *
                  </label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    required
                    value={billingInfo.city}
                    onChange={handleInputChange}
                    className="input"
                  />
                </div>
                <div>
                  <label htmlFor="state" className="mb-1 block font-medium">
                    State *
                  </label>
                  <input
                    id="state"
                    name="state"
                    type="text"
                    required
                    value={billingInfo.state}
                    onChange={handleInputChange}
                    className="input"
                  />
                </div>
                <div>
                  <label htmlFor="postcode" className="mb-1 block font-medium">
                    ZIP Code *
                  </label>
                  <input
                    id="postcode"
                    name="postcode"
                    type="text"
                    required
                    value={billingInfo.postcode}
                    onChange={handleInputChange}
                    className="input"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="btn-primary w-full text-lg"
            >
              {isProcessing ? "Processing..." : "Proceed to Payment"}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div>
          <div className="card sticky top-24">
            <h2 className="mb-4 text-xl font-semibold">Order Summary</h2>

            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.product.id} className="flex gap-3">
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded">
                    {item.product.image && (
                      <img
                        src={item.product.image.sourceUrl}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-gray-600">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatPrice(
                        parseFloat(
                          item.variation?.price || item.product.price || "0"
                        ) * item.quantity
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t pt-4">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total:</span>
                <span>{formatPrice(getCartTotal())}</span>
              </div>
            </div>

            <p className="mt-4 text-sm text-gray-600">
              Payment will be processed securely through Stripe.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

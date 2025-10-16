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
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "cod">(
    "stripe"
  );

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
      if (paymentMethod === "cod") {
        // Handle Cash on Delivery
        await handleCashOnDelivery();
      } else {
        // Handle Stripe payment
        await handleStripePayment();
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast.error(error.message || "Failed to process checkout");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCashOnDelivery = async () => {
    // Create order via WooCommerce API for Cash on Delivery
    const response = await fetch("/api/checkout/cod", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items,
        billingInfo,
        paymentMethod: "cod",
      }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    // Clear cart and redirect to success page
    clearCart();
    toast.success("Order placed successfully!");
    router.push(
      `/checkout/success?order=${data.orderId}&payment_method=cod&hash=${data.orderHash}`
    );
  };

  const handleStripePayment = async () => {
    // Create Stripe checkout session
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items,
        customerEmail: billingInfo.email,
        billingInfo,
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

            {/* Payment Method Selection */}
            <div className="card">
              <h2 className="mb-4 text-xl font-semibold">Payment Method</h2>

              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="stripe"
                    checked={paymentMethod === "stripe"}
                    onChange={(e) =>
                      setPaymentMethod(e.target.value as "stripe" | "cod")
                    }
                    className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">Credit/Debit Card</span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        SECURE
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Pay securely with Stripe
                    </p>
                  </div>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={(e) =>
                      setPaymentMethod(e.target.value as "stripe" | "cod")
                    }
                    className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">Cash on Delivery</span>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        COD
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Pay with cash when your order is delivered
                    </p>
                  </div>
                </label>
              </div>

              {paymentMethod === "cod" && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <svg
                      className="w-5 h-5 text-yellow-600 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-yellow-800">
                        Cash on Delivery
                      </p>
                      <p className="text-sm text-yellow-700">
                        Please ensure you have the exact amount ready when the
                        delivery arrives. Additional delivery charges may apply.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="btn-primary w-full text-lg"
            >
              {isProcessing
                ? "Processing..."
                : paymentMethod === "cod"
                ? "Place Order (Cash on Delivery)"
                : "Proceed to Payment"}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div>
          <div className="card sticky top-24">
            <h2 className="mb-4 text-xl font-semibold">Order Summary</h2>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div
                  key={`${item.product.id}-${
                    item.variation?.databaseId || "no-variation"
                  }-${index}`}
                  className="flex gap-3"
                >
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
              {paymentMethod === "cod"
                ? "You will pay with cash when your order is delivered."
                : "Payment will be processed securely through Stripe."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

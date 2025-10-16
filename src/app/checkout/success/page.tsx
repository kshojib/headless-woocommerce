"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: string;
  total: string;
  image?: {
    src: string;
    alt: string;
  };
}

interface OrderDetails {
  id: number;
  number: string;
  status: string;
  total: string;
  currency: string;
  date_created: string;
  payment_method_title: string;
  billing: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
  shipping: {
    first_name: string;
    last_name: string;
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
  line_items: OrderItem[];
  shipping_total: string;
  tax_total: string;
}

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");
  const paymentMethod = searchParams.get("payment_method");
  const orderHash = searchParams.get("hash");
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const url = orderHash
        ? `/api/orders/${orderId}?hash=${orderHash}`
        : `/api/orders/${orderId}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch order details");
      }

      const data = await response.json();
      setOrderDetails(data);
    } catch (err: any) {
      console.error("Error fetching order details:", err);
      setError("Unable to load order details");
    } finally {
      setLoading(false);
    }
  };

  const isCOD = paymentMethod === "cod";

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-6 text-6xl">{isCOD ? "📦" : "✅"}</div>
          <h1 className="mb-4 text-3xl font-bold">
            {isCOD ? "Order Placed!" : "Payment Successful!"}
          </h1>

          {orderId && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg inline-block">
              <p className="text-sm font-medium text-green-800">
                Order #{orderId}
              </p>
            </div>
          )}

          {isCOD ? (
            <div className="mb-8 space-y-4">
              <p className="text-gray-600">
                Thank you for your order! Your items will be delivered to your
                address.
              </p>
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg max-w-md mx-auto">
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
                  <div className="text-left">
                    <p className="text-sm font-medium text-yellow-800">
                      Cash on Delivery
                    </p>
                    <p className="text-sm text-yellow-700">
                      Please have the exact amount ready when our delivery
                      partner arrives. Additional delivery charges may apply.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="mb-8 text-gray-600">
              Thank you for your purchase. Your payment has been processed
              successfully and your order will be shipped shortly.
            </p>
          )}
        </div>

        {/* Order Details */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-2 text-gray-600">Loading order details...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {orderDetails && (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Order Summary */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Number:</span>
                  <span className="font-medium">#{orderDetails.number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">
                    {new Date(orderDetails.date_created).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm capitalize">
                    {orderDetails.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-medium">
                    {orderDetails.payment_method_title}
                  </span>
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span>
                    {formatPrice(
                      parseFloat(orderDetails.total) -
                        parseFloat(orderDetails.shipping_total) -
                        parseFloat(orderDetails.tax_total)
                    )}
                  </span>
                </div>
                {parseFloat(orderDetails.shipping_total) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping:</span>
                    <span>
                      {formatPrice(parseFloat(orderDetails.shipping_total))}
                    </span>
                  </div>
                )}
                {parseFloat(orderDetails.tax_total) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax:</span>
                    <span>
                      {formatPrice(parseFloat(orderDetails.tax_total))}
                    </span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>{formatPrice(parseFloat(orderDetails.total))}</span>
                </div>
              </div>
            </div>

            {/* Addresses */}
            <div className="space-y-6">
              {/* Billing Address */}
              <div className="card">
                <h3 className="text-lg font-semibold mb-3">Billing Address</h3>
                <div className="text-sm space-y-1">
                  <p className="font-medium">
                    {orderDetails.billing.first_name}{" "}
                    {orderDetails.billing.last_name}
                  </p>
                  <p>{orderDetails.billing.address_1}</p>
                  {orderDetails.billing.address_2 && (
                    <p>{orderDetails.billing.address_2}</p>
                  )}
                  <p>
                    {orderDetails.billing.city}, {orderDetails.billing.state}{" "}
                    {orderDetails.billing.postcode}
                  </p>
                  <p>{orderDetails.billing.country}</p>
                  <p className="pt-2">
                    <span className="text-gray-600">Email:</span>{" "}
                    {orderDetails.billing.email}
                  </p>
                  {orderDetails.billing.phone && (
                    <p>
                      <span className="text-gray-600">Phone:</span>{" "}
                      {orderDetails.billing.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="card">
                <h3 className="text-lg font-semibold mb-3">Shipping Address</h3>
                <div className="text-sm space-y-1">
                  <p className="font-medium">
                    {orderDetails.shipping.first_name}{" "}
                    {orderDetails.shipping.last_name}
                  </p>
                  <p>{orderDetails.shipping.address_1}</p>
                  {orderDetails.shipping.address_2 && (
                    <p>{orderDetails.shipping.address_2}</p>
                  )}
                  <p>
                    {orderDetails.shipping.city}, {orderDetails.shipping.state}{" "}
                    {orderDetails.shipping.postcode}
                  </p>
                  <p>{orderDetails.shipping.country}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Order Items */}
        {orderDetails && (
          <div className="card mt-8">
            <h2 className="text-xl font-semibold mb-4">Order Items</h2>
            <div className="space-y-4">
              {orderDetails.line_items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 py-4 border-b last:border-b-0"
                >
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    {item.image ? (
                      <img
                        src={item.image.src}
                        alt={item.image.alt}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="text-gray-400 text-2xl">📦</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-600">
                      Quantity: {item.quantity} ×{" "}
                      {formatPrice(parseFloat(item.price))}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatPrice(parseFloat(item.total))}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="text-center mt-8">
          <p className="mb-8 text-sm text-gray-500">
            You will receive a confirmation email with your order details and
            tracking information.
          </p>

          <div className="flex gap-4 justify-center">
            <Link href="/products" className="btn-primary">
              Continue Shopping
            </Link>
            <Link href="/account" className="btn-secondary">
              View Orders
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-16 text-center">
          Loading...
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}

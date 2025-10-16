"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import {
  getAuthenticatedClient,
  GET_ORDER_DETAILS,
} from "@/lib/graphql-client";
import { formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";

interface OrderDetailsPageProps {
  params: {
    orderId: string;
  };
}

export default function OrderDetailsPage({ params }: OrderDetailsPageProps) {
  const router = useRouter();
  const { isAuthenticated, token } = useAuthStore();
  const { addItem } = useCartStore();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    async function fetchOrder() {
      if (!token) return;

      try {
        const client = getAuthenticatedClient(token);
        const data: any = await client.request(GET_ORDER_DETAILS, {
          id: parseInt(params.orderId),
        });

        if (data.order) {
          setOrder(data.order);
        } else {
          setError("Order not found");
        }
      } catch (error) {
        console.error("Error fetching order:", error);
        setError("Failed to load order details");
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [isAuthenticated, token, router, params.orderId]);

  const handleReorder = async () => {
    if (!order?.lineItems?.nodes) return;

    setReordering(true);
    let addedItems = 0;

    try {
      for (const item of order.lineItems.nodes) {
        if (item.product?.node) {
          // Create a simplified product object for the cart
          const product = {
            id: item.product.node.id,
            databaseId: item.productId || 0,
            name: item.product.node.name,
            slug: item.product.node.slug,
            price: (
              parseFloat(item.total.replace(/[^0-9.-]+/g, "")) / item.quantity
            ).toFixed(2),
            onSale: false,
            image: item.product.node.image,
          };

          addItem(product, item.quantity);
          addedItems++;
        }
      }

      if (addedItems > 0) {
        toast.success(
          `Added ${addedItems} item${addedItems > 1 ? "s" : ""} to cart`
        );
        router.push("/cart");
      } else {
        toast.error("No items could be added to cart");
      }
    } catch (error) {
      console.error("Reorder error:", error);
      toast.error("Failed to add items to cart");
    } finally {
      setReordering(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/account" className="text-primary-600 hover:underline">
            ← Back to Account
          </Link>
        </div>
        <div className="card">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent mx-auto"></div>
              <p className="text-gray-600">Loading order details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="card">
          <div className="text-center">
            <p className="mb-4 text-red-600">{error || "Order not found"}</p>
            <Link href="/account" className="btn-primary">
              Back to Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/account" className="text-primary-600 hover:underline">
          ← Back to Account
        </Link>
      </div>

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Order #{order.orderNumber}</h1>
          <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
            <span>Order Date: {new Date(order.date).toLocaleDateString()}</span>
            <span>
              Status: <span className="font-medium">{order.status}</span>
            </span>
            <span>Payment: {order.paymentMethodTitle}</span>
          </div>
        </div>
        <button
          onClick={handleReorder}
          disabled={reordering}
          className="btn-secondary disabled:opacity-50"
        >
          {reordering ? "Adding to Cart..." : "Reorder"}
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Order Items */}
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="mb-4 text-xl font-semibold">Order Items</h2>
            <div className="space-y-4">
              {order.lineItems.nodes.map((item: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 border-b pb-4 last:border-b-0"
                >
                  {item.product?.node?.image && (
                    <img
                      src={item.product.node.image.sourceUrl}
                      alt={
                        item.product.node.image.altText ||
                        item.product.node.name
                      }
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-medium">
                      {item.product?.node?.name || "Product"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{item.total}</p>
                    {item.subtotal !== item.total && (
                      <p className="text-sm text-gray-600">
                        Subtotal: {item.subtotal}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary & Addresses */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="card">
            <h2 className="mb-4 text-xl font-semibold">Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{order.subtotal}</span>
              </div>
              {order.shippingTotal && order.shippingTotal !== "$0.00" && (
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>{order.shippingTotal}</span>
                </div>
              )}
              {order.totalTax && order.totalTax !== "$0.00" && (
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>{order.totalTax}</span>
                </div>
              )}
              <div className="border-t pt-2">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total:</span>
                  <span>{order.total}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Billing Address */}
          {order.billing && (
            <div className="card">
              <h3 className="mb-3 font-semibold">Billing Address</h3>
              <div className="text-sm space-y-1">
                <p>
                  {order.billing.firstName} {order.billing.lastName}
                </p>
                {order.billing.company && <p>{order.billing.company}</p>}
                <p>{order.billing.address1}</p>
                {order.billing.address2 && <p>{order.billing.address2}</p>}
                <p>
                  {order.billing.city}, {order.billing.state}{" "}
                  {order.billing.postcode}
                </p>
                <p>{order.billing.country}</p>
                {order.billing.email && (
                  <p className="mt-2">Email: {order.billing.email}</p>
                )}
                {order.billing.phone && <p>Phone: {order.billing.phone}</p>}
              </div>
            </div>
          )}

          {/* Shipping Address */}
          {order.shipping &&
            (order.shipping.address1 || order.shipping.firstName) && (
              <div className="card">
                <h3 className="mb-3 font-semibold">Shipping Address</h3>
                <div className="text-sm space-y-1">
                  <p>
                    {order.shipping.firstName} {order.shipping.lastName}
                  </p>
                  {order.shipping.company && <p>{order.shipping.company}</p>}
                  <p>{order.shipping.address1}</p>
                  {order.shipping.address2 && <p>{order.shipping.address2}</p>}
                  <p>
                    {order.shipping.city}, {order.shipping.state}{" "}
                    {order.shipping.postcode}
                  </p>
                  <p>{order.shipping.country}</p>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

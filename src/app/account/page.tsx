"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import {
  getAuthenticatedClient,
  GET_CUSTOMER_ORDERS,
} from "@/lib/graphql-client";

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, token, logout } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    async function fetchOrders() {
      if (!token) return;

      try {
        const client = getAuthenticatedClient(token);
        const data: any = await client.request(GET_CUSTOMER_ORDERS, {
          first: 10,
        });
        setOrders(data.customer?.orders?.nodes || []);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [isAuthenticated, token, router]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Account</h1>
        <button onClick={handleLogout} className="btn-secondary">
          Logout
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Account Info */}
        <div className="card lg:col-span-1">
          <h2 className="mb-4 text-xl font-semibold">Account Details</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-medium">
                {user?.firstName} {user?.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Username</p>
              <p className="font-medium">{user?.username}</p>
            </div>
          </div>
        </div>

        {/* Order History */}
        <div className="card lg:col-span-2">
          <h2 className="mb-4 text-xl font-semibold">Order History</h2>
          {loading ? (
            <p className="text-gray-600">Loading orders...</p>
          ) : orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold">
                        Order #{order.orderNumber}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(order.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{order.total}</p>
                      <p className="text-sm text-gray-600">{order.status}</p>
                    </div>
                  </div>
                  
                  {/* Order Items Summary */}
                  {order.lineItems?.nodes && order.lineItems.nodes.length > 0 && (
                    <div className="mb-3 text-sm text-gray-600">
                      {order.lineItems.nodes.length} item{order.lineItems.nodes.length > 1 ? 's' : ''} • 
                      Total quantity: {order.lineItems.nodes.reduce((total: number, item: any) => total + item.quantity, 0)}
                    </div>
                  )}
                  
                  <div className="flex justify-end">
                    <Link
                      href={`/account/orders/${order.databaseId}`}
                      className="btn-primary text-sm"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">
              No orders yet.{" "}
              <Link
                href="/products"
                className="text-primary-600 hover:underline"
              >
                Start shopping
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

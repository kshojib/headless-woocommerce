import Link from "next/link";

export default function CheckoutSuccessPage() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="mx-auto max-w-md">
        <div className="mb-6 text-6xl">✅</div>
        <h1 className="mb-4 text-3xl font-bold">Order Successful!</h1>
        <p className="mb-8 text-gray-600">
          Thank you for your purchase. Your order has been received and will be
          processed shortly.
        </p>
        <p className="mb-8 text-sm text-gray-500">
          You will receive a confirmation email with your order details.
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
  );
}

import Link from "next/link";

export default function CheckoutCancelPage() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="mx-auto max-w-md">
        <div className="mb-6 text-6xl">❌</div>
        <h1 className="mb-4 text-3xl font-bold">Checkout Cancelled</h1>
        <p className="mb-8 text-gray-600">
          Your checkout was cancelled. No charges were made.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/checkout" className="btn-primary">
            Return to Checkout
          </Link>
          <Link href="/products" className="btn-secondary">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

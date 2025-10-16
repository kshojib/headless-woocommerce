import { graphQLClient, GET_PRODUCTS } from "@/lib/graphql-client";
import { ProductCard } from "@/components/ProductCard";
import { Product } from "@/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Products",
  description: "Browse our complete collection of products",
};

async function getProducts() {
  try {
    const data = await graphQLClient.request(GET_PRODUCTS, { first: 50 });
    return (data as any).products.nodes as Product[];
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">All Products</h1>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center">
          <p className="text-xl text-gray-600">
            No products found. Please check your WooCommerce connection.
          </p>
          <p className="mt-4 text-sm text-gray-500">
            Make sure WPGraphQL and WooGraphQL plugins are installed and
            activated.
          </p>
        </div>
      )}
    </div>
  );
}

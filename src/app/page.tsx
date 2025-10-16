import Link from "next/link";
import {
  graphQLClient,
  GET_PRODUCTS,
  GET_CATEGORIES,
} from "@/lib/graphql-client";
import { ProductCard } from "@/components/ProductCard";
import { Product, Category } from "@/types";

async function getHomePageData() {
  try {
    const [productsData, categoriesData] = await Promise.all([
      graphQLClient.request(GET_PRODUCTS, { first: 8 }),
      graphQLClient.request(GET_CATEGORIES, { first: 6 }),
    ]);

    return {
      products: (productsData as any).products.nodes as Product[],
      categories: (categoriesData as any).productCategories.nodes as Category[],
    };
  } catch (error) {
    console.error("Error fetching home page data:", error);
    return { products: [], categories: [] };
  }
}

export default async function HomePage() {
  const { products, categories } = await getHomePageData();

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-3xl">
            <h1 className="mb-4 text-5xl font-bold">Welcome to Our Store</h1>
            <p className="mb-8 text-xl">
              Discover amazing products at great prices
            </p>
            <Link
              href="/products"
              className="inline-block rounded-lg bg-white px-8 py-3 font-semibold text-primary-600 transition hover:bg-gray-100"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      {categories.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="mb-8 text-3xl font-bold">Shop by Category</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  className="group rounded-lg border p-4 text-center transition hover:border-primary-500 hover:shadow-lg"
                >
                  {category.image && (
                    <img
                      src={category.image.sourceUrl}
                      alt={category.name}
                      className="mb-2 h-20 w-full object-contain"
                    />
                  )}
                  <h3 className="font-semibold group-hover:text-primary-600">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {category.count} items
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-3xl font-bold">Featured Products</h2>
            <Link
              href="/products"
              className="text-primary-600 hover:text-primary-700"
            >
              View All →
            </Link>
          </div>
          {products.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">No products available</p>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mb-4 text-4xl">🚚</div>
              <h3 className="mb-2 text-xl font-semibold">Free Shipping</h3>
              <p className="text-gray-600">On orders over $50</p>
            </div>
            <div className="text-center">
              <div className="mb-4 text-4xl">🔒</div>
              <h3 className="mb-2 text-xl font-semibold">Secure Payment</h3>
              <p className="text-gray-600">100% secure transactions</p>
            </div>
            <div className="text-center">
              <div className="mb-4 text-4xl">↩️</div>
              <h3 className="mb-2 text-xl font-semibold">Easy Returns</h3>
              <p className="text-gray-600">30-day return policy</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

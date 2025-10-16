import Link from "next/link";
import {
  graphQLClient,
  GET_PRODUCTS,
  GET_RECENT_PRODUCTS,
  GET_CATEGORIES,
} from "@/lib/graphql-client";
import { wooCommerceAPI } from "@/lib/woocommerce-api";
import { ProductCard } from "@/components/ProductCard";
import { Product, Category } from "@/types";

async function getHomePageData() {
  try {
    // Use REST API directly for recent products since GraphQL ordering might not be supported
    let recentProducts: Product[] = [];

    try {
      console.log("Fetching recent products via REST API...");
      const restProducts = await wooCommerceAPI.getRecentProducts(6);
      console.log("REST API success, got", restProducts?.length || 0, "products");
      
      if (restProducts && restProducts.length > 0) {
        // Transform REST API response to match our Product interface
        recentProducts = restProducts.map((product: any) => ({
          id: product.id.toString(),
          databaseId: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description || '',
          shortDescription: product.short_description || '',
          onSale: product.on_sale || false,
          dateCreated: product.date_created,
          price: product.price || '0',
          regularPrice: product.regular_price || '0',
          salePrice: product.sale_price || '',
          stockStatus: product.stock_status || 'instock',
          image: product.images && product.images[0]
            ? {
                sourceUrl: product.images[0].src,
                altText: product.images[0].alt || product.name,
              }
            : null,
          productCategories: {
            nodes: product.categories ? product.categories.map((cat: any) => ({
              id: cat.id.toString(),
              databaseId: cat.id,
              name: cat.name,
              slug: cat.slug,
            })) : [],
          },
          averageRating: product.average_rating || 0,
          reviewCount: product.review_count || 0,
        }));
        console.log("Transformed", recentProducts.length, "recent products");
      }
    } catch (restError) {
      console.error("REST API failed for recent products:", restError);
    }

    try {
      const [productsData, categoriesData] = await Promise.all([
        graphQLClient.request(GET_PRODUCTS, { first: 8 }),
        graphQLClient.request(GET_CATEGORIES, { first: 6 }),
      ]);

      return {
        products: (productsData as any).products.nodes as Product[],
        categories: (categoriesData as any).productCategories.nodes as Category[],
        recentProducts,
      };
    } catch (mainError) {
      console.error("Error fetching main products/categories via GraphQL, trying REST API fallback...");
      
      // If GraphQL fails completely, try using REST API for main products too
      try {
        const [restProducts, restCategories] = await Promise.all([
          wooCommerceAPI.getProducts({ per_page: 8 }),
          wooCommerceAPI.getCategories({ per_page: 6 }),
        ]);

        const transformedProducts = restProducts.map((product: any) => ({
          id: product.id.toString(),
          databaseId: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          shortDescription: product.short_description,
          onSale: product.on_sale,
          price: product.price,
          regularPrice: product.regular_price,
          salePrice: product.sale_price,
          stockStatus: product.stock_status,
          image: product.images && product.images[0]
            ? {
                sourceUrl: product.images[0].src,
                altText: product.images[0].alt || product.name,
              }
            : null,
          productCategories: {
            nodes: product.categories ? product.categories.map((cat: any) => ({
              id: cat.id.toString(),
              databaseId: cat.id,
              name: cat.name,
              slug: cat.slug,
            })) : [],
          },
          averageRating: product.average_rating,
          reviewCount: product.review_count,
        }));

        const transformedCategories = restCategories.map((category: any) => ({
          id: category.id.toString(),
          databaseId: category.id,
          name: category.name,
          slug: category.slug,
          count: category.count,
          image: category.image ? {
            sourceUrl: category.image.src,
            altText: category.name,
          } : null,
        }));

        return {
          products: transformedProducts,
          categories: transformedCategories,
          recentProducts,
        };
      } catch (restFallbackError) {
        console.error("REST API fallback also failed:", restFallbackError);
        return { products: [], categories: [], recentProducts };
      }
    }
  } catch (error) {
    console.error("Error fetching home page data:", error);
    return { products: [], categories: [], recentProducts: [] };
  }
}

export default async function HomePage() {
  const { products, categories, recentProducts } = await getHomePageData();

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

      {/* Recent Products Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-3xl font-bold">Recently Added</h2>
            <Link
              href="/products"
              className="text-primary-600 hover:text-primary-700"
            >
              View All →
            </Link>
          </div>
          {recentProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {recentProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No recent products available at the moment.</p>
              <p className="text-sm text-gray-400">Debug: Recent products array length: {recentProducts.length}</p>
            </div>
          )}
        </div>
      </section>

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

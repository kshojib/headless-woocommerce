import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  graphQLClient,
  GET_PRODUCT_BY_SLUG,
  GET_PRODUCTS,
  GET_PRODUCTS_BY_CATEGORY,
} from "@/lib/graphql-client";
import { Product } from "@/types";
import { formatPrice } from "@/lib/utils";
import { AddToCartButton } from "@/components/AddToCartButton";
import { ProductSchema } from "@/components/SEO/ProductSchema";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductInfoClient } from "@/components/ProductInfoClient";
import type { Metadata } from "next";

interface ProductPageProps {
  params: {
    slug: string;
  };
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  try {
    const data = await graphQLClient.request(GET_PRODUCT_BY_SLUG, {
      slug: params.slug,
    });
    const product = (data as any).product as Product;

    if (!product) {
      return {
        title: "Product Not Found",
      };
    }

    return {
      title: product.name,
      description: product.shortDescription || product.description || "",
      openGraph: {
        title: product.name,
        description: product.shortDescription || "",
        images: product.image
          ? [
              {
                url: product.image.sourceUrl,
                width: 800,
                height: 600,
                alt: product.name,
              },
            ]
          : [],
        type: "website",
        siteName: process.env.NEXT_PUBLIC_SITE_NAME,
      },
    };
  } catch (error) {
    return {
      title: "Product Not Found",
    };
  }
}

// Generate static params for ISR
export async function generateStaticParams() {
  try {
    const data = await graphQLClient.request(GET_PRODUCTS, { first: 50 });
    const products = (data as any).products.nodes as Product[];

    return products.map((product) => ({
      slug: product.slug,
    }));
  } catch (error) {
    return [];
  }
}

export const revalidate = 3600; // Revalidate every hour

export default async function ProductPage({ params }: ProductPageProps) {
  try {
    const data = await graphQLClient.request(GET_PRODUCT_BY_SLUG, {
      slug: params.slug,
    });
    const product = (data as any).product as Product;

    if (!product) {
      notFound();
    }

    // Get related products from the same category
    let relatedProducts: Product[] = [];
    if (
      product.productCategories &&
      product.productCategories.nodes.length > 0
    ) {
      try {
        const categorySlug = product.productCategories.nodes[0].slug;
        console.log("Fetching related products for category:", categorySlug);

        const relatedData = await graphQLClient.request(
          GET_PRODUCTS_BY_CATEGORY,
          { categorySlug, first: 10 }
        );

        const allCategoryProducts = (relatedData as any).products
          .nodes as Product[];
        console.log("Found products in category:", allCategoryProducts.length);

        relatedProducts = allCategoryProducts
          .filter((p) => p.slug !== product.slug)
          .slice(0, 4);

        console.log("Related products to show:", relatedProducts.length);
      } catch (error) {
        console.error("Error fetching related products:", error);
      }
    }

    const images = [
      product.image,
      ...(product.galleryImages?.nodes || []),
    ].filter(Boolean);

    return (
      <>
        <ProductSchema product={product} />
        <div className="container mx-auto px-4 py-8">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Product Images */}
            <ProductGallery
              images={images.filter(
                (img): img is NonNullable<typeof img> => img !== null
              )}
              productName={product.name}
            />

            {/* Product Info */}
            <div>
              <h1 className="text-3xl font-bold">{product.name}</h1>

              {/* Categories */}
              {product.productCategories &&
                product.productCategories.nodes.length > 0 && (
                  <div className="mt-2 flex gap-2">
                    {product.productCategories.nodes.map((category) => (
                      <span
                        key={category.id}
                        className="rounded bg-gray-100 px-3 py-1 text-sm"
                      >
                        {category.name}
                      </span>
                    ))}
                  </div>
                )}

              {/* Rating */}
              {product.averageRating &&
                product.averageRating > 0 &&
                product.reviewCount &&
                product.reviewCount > 0 && (
                  <div className="mt-4 flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={
                            i < Math.round(product.averageRating || 0)
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {product.averageRating} ({product.reviewCount} reviews)
                    </span>
                  </div>
                )}

              {/* Client-side interactive sections */}
              <ProductInfoClient product={product} />
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-16">
              <h2 className="mb-8 text-2xl font-bold">You May Also Like</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {relatedProducts.map((relatedProduct) => (
                  <Link
                    key={relatedProduct.id}
                    href={`/product/${relatedProduct.slug}`}
                    className="card group"
                  >
                    {/* Product Image */}
                    <div className="relative aspect-square overflow-hidden rounded-lg">
                      {relatedProduct.image ? (
                        <Image
                          src={relatedProduct.image.sourceUrl}
                          alt={
                            relatedProduct.image.altText || relatedProduct.name
                          }
                          fill
                          className="object-cover transition duration-300 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gray-200">
                          <span className="text-gray-400">No Image</span>
                        </div>
                      )}
                      {relatedProduct.onSale && (
                        <span className="absolute left-2 top-2 rounded bg-red-500 px-2 py-1 text-xs font-semibold text-white">
                          Sale
                        </span>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="mt-4">
                      <h3 className="line-clamp-2 font-semibold group-hover:text-primary-600">
                        {relatedProduct.name}
                      </h3>

                      {/* Price */}
                      <div className="mt-2 flex items-center gap-2">
                        {relatedProduct.onSale &&
                        relatedProduct.regularPrice ? (
                          <>
                            <span className="text-lg font-bold text-primary-600">
                              {formatPrice(
                                relatedProduct.salePrice ||
                                  relatedProduct.price ||
                                  "0"
                              )}
                            </span>
                            <span className="text-sm text-gray-500 line-through">
                              {formatPrice(relatedProduct.regularPrice)}
                            </span>
                          </>
                        ) : (
                          <span className="text-lg font-bold">
                            {formatPrice(relatedProduct.price || "0")}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </>
    );
  } catch (error) {
    console.error("Error fetching product:", error);
    notFound();
  }
}

import { notFound } from "next/navigation";
import {
  graphQLClient,
  GET_PRODUCTS_BY_CATEGORY,
  GET_CATEGORIES,
} from "@/lib/graphql-client";
import { ProductCard } from "@/components/ProductCard";
import { Product, Category } from "@/types";
import type { Metadata } from "next";

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  try {
    const data = await graphQLClient.request(GET_CATEGORIES, { first: 100 });
    const categories = (data as any).productCategories.nodes as Category[];
    const category = categories.find((cat) => cat.slug === params.slug);

    if (!category) {
      return { title: "Category Not Found" };
    }

    return {
      title: category.name,
      description: category.description || `Browse ${category.name} products`,
    };
  } catch (error) {
    return { title: "Category" };
  }
}

export async function generateStaticParams() {
  try {
    const data = await graphQLClient.request(GET_CATEGORIES, { first: 50 });
    const categories = (data as any).productCategories.nodes as Category[];
    return categories.map((category) => ({ slug: category.slug }));
  } catch (error) {
    return [];
  }
}

export const revalidate = 3600;

export default async function CategoryPage({ params }: CategoryPageProps) {
  try {
    const [categoriesData, productsData] = await Promise.all([
      graphQLClient.request(GET_CATEGORIES, { first: 100 }),
      graphQLClient.request(GET_PRODUCTS_BY_CATEGORY, {
        categorySlug: params.slug,
        first: 50,
      }),
    ]);

    const categories = (categoriesData as any).productCategories
      .nodes as Category[];
    const category = categories.find((cat) => cat.slug === params.slug);
    const products = (productsData as any).products.nodes as Product[];

    if (!category) {
      notFound();
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{category.name}</h1>
          {category.description && (
            <p className="mt-2 text-gray-600">{category.description}</p>
          )}
          <p className="mt-2 text-sm text-gray-500">
            {products.length} {products.length === 1 ? "product" : "products"}
          </p>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center">
            <p className="text-xl text-gray-600">
              No products found in this category.
            </p>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error("Error fetching category:", error);
    notFound();
  }
}

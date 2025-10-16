import Link from "next/link";
import { graphQLClient, GET_CATEGORIES } from "@/lib/graphql-client";
import { Category } from "@/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Categories",
  description: "Browse products by category",
};

async function getCategories() {
  try {
    const data = await graphQLClient.request(GET_CATEGORIES, { first: 50 });
    return (data as any).productCategories.nodes as Category[];
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Categories</h1>

      {categories.length > 0 ? (
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="card group h-full"
            >
              {category.image && (
                <div className="mb-4 aspect-square overflow-hidden rounded-lg">
                  <img
                    src={category.image.sourceUrl}
                    alt={category.name}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                </div>
              )}
              <h3 className="text-lg font-semibold group-hover:text-primary-600">
                {category.name}
              </h3>
              {category.count !== undefined && (
                <p className="mt-1 text-sm text-gray-500">
                  {category.count} {category.count === 1 ? "item" : "items"}
                </p>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center">
          <p className="text-xl text-gray-600">No categories found.</p>
        </div>
      )}
    </div>
  );
}

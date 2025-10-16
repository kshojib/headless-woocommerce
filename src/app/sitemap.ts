import { MetadataRoute } from 'next';
import { graphQLClient, GET_PRODUCTS, GET_CATEGORIES } from '@/lib/graphql-client';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  try {
    const [productsData, categoriesData] = await Promise.all([
      graphQLClient.request(GET_PRODUCTS, { first: 100 }),
      graphQLClient.request(GET_CATEGORIES, { first: 50 }),
    ]);

    const products = (productsData as any).products.nodes || [];
    const categories = (categoriesData as any).productCategories.nodes || [];

    const productUrls = products.map((product: any) => ({
      url: `${baseUrl}/product/${product.slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }));

    const categoryUrls = categories.map((category: any) => ({
      url: `${baseUrl}/category/${category.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      {
        url: `${baseUrl}/products`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      ...productUrls,
      ...categoryUrls,
    ];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
    ];
  }
}

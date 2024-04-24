import { getCachedCategories } from '@/trpc/cache';
import { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SERVER_URL;

const sitemap = async (): Promise<MetadataRoute.Sitemap> => {
  const categories = (await getCachedCategories()) || [];
  const products = categories.map((category) => category.packages).flat();

  const productsMetadata: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${SITE_URL}/dashboard/shop/${product.id}`,
    lastModified: product.updated_at,
    priority: 0.8,
  }));
  const categoriesMetadata: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${SITE_URL}/dashboard/shop/category/${category.id}`,
    priority: 0.9,
  }));

  return [
    {
      url: `${SITE_URL}/dashboard`,
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/dashboard/tickets/create`,
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/dashboard/tickets`,
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/dashboard/tribe`,
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/dashboard/tribe/logs`,
      priority: 0.7,
    },
    ...productsMetadata,
    ...categoriesMetadata,
  ];
};

export default sitemap;

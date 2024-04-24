'use server';
import { getCachedCategories } from '@/trpc/cache';
import { startCase } from 'lodash';
import { Metadata } from 'next';
import { cache } from 'react';

const getCategory = cache(async (categoryId: string) => {
  const cachedCategories = await getCachedCategories();
  const parsedId = parseInt(categoryId);

  const category = cachedCategories.find((entry) => entry.id === parsedId);

  return category || null;
});

export const generateMetadata = async ({ params }: { params: { categoryId: string } }): Promise<Metadata> => {
  const category = await getCategory(params.categoryId);

  let description = category?.description || '';
  description = description.replace(/<[^>]*>/gi, ' ').trim();

  const products = (category?.packages.map((entry) => entry.name) || []).join(', ');

  const randomImage = category?.packages
    ? category.packages[Math.floor(Math.random() * category.packages.length)].image
    : null;

  description += `. This category includes: ${products}`;

  return {
    title: startCase(category?.name),
    openGraph: {
      ...(randomImage && {
        images: {
          url: randomImage,
        },
      }),
      description,
    },
  };
};

const CategoryPageLayout = async ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export default CategoryPageLayout;

'use server';
import { getCachedCategories } from '@/trpc/cache';
import { startCase } from 'lodash';
import { Metadata } from 'next';
import { cache } from 'react';

const getProduct = cache(async (productId: string) => {
  const cachedCategories = await getCachedCategories();
  const parsedId = parseInt(productId);

  const product = cachedCategories
    .find((category) => category.packages.some((entry) => entry.id === parsedId))
    ?.packages.find((entry) => entry.id === parsedId);

  return product || null;
});

export const generateMetadata = async ({ params }: { params: { productId: string } }): Promise<Metadata> => {
  const product = await getProduct(params.productId);
  let description = product?.description || '';
  description = description.replace(/<[^>]*>/gi, ' ').trim();

  return {
    title: startCase(product?.name),
    openGraph: {
      ...(product?.image && {
        images: {
          url: product.image,
        },
      }),
      description,
    },
  };
};

const ProductPageLayout = async ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export default ProductPageLayout;

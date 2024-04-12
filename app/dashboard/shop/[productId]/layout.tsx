'use server';
import { shopGetCategories } from '@/shared/lib/tebex';
import { startCase } from 'lodash';
import { Metadata } from 'next';
import { cache } from 'react';

const getProduct = cache(async (productId: string) => {
  const parsedId = parseInt(productId);
  const categories = await shopGetCategories();

  const product = categories
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

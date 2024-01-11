'use client';
import ProductBox from '@/components/shared/ProductBox';
import { useTebex } from '@/hooks/use-tebex';
import { useEffect, useState } from 'react';
import { trpc } from '@/trpc';

const ForYou = () => {
  const [isMounted, setIsMounted] = useState(false);
  const { categoryList } = useTebex();

  useEffect(() => setIsMounted(true), []);

  const products = categoryList.map((entry) => entry.packages).flat();
  const productIds = categoryList.map((entry) => entry.packages.map((item) => item.id)).flat();

  const { data: topPicks, isLoading: isApiLoading } = trpc.getTopPicks.useQuery(
    { activeProducts: productIds },
    {
      retry: false,
      refetchOnWindowFocus: false,
      enabled: isMounted,
    },
  );

  const isLoading = isApiLoading || !isMounted;

  if (!isLoading && !topPicks) return null;
  if (!products) return null;

  return (
    <div className="w-full relative">
      <div className="flex space-x-2 items-center mb-2">
        <h1 className="font-semibold text-2xl md:text-2xl text-primary">For You</h1>
        <p className="text-muted-foreground text-sm">Click on an image to see the full description</p>
      </div>
      <div
        className="grid grid-cols-1 smb:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2.5xl:grid-cols-3
                  gap-y-12 md:gap-y-6 gap-x-3 md:gap-x-6 2.5xl:gap-x-12 2.5xl:gap-y-12 3xl:grid-cols-4 place-items-center md:place-items-start mt-6 mb:mt-0"
      >
        {isLoading
          ? [...Array.from(Array(8).keys())].map((index) => <ProductBox.Skeleton key={`${index}-skeleton`} />)
          : topPicks &&
            topPicks.map((productId) => {
              const product = products.find((entry) => entry.id === productId);
              if (!product) return null;
              return (
                <ProductBox
                  key={product.id}
                  basePrice={product.base_price}
                  description={product.description}
                  imageURL={product.image ?? '/logo.png'}
                  name={product.name}
                  productId={productId}
                  gradient={true}
                />
              );
            })}
      </div>
    </div>
  );
};

export default ForYou;

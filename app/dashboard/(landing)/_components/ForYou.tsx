'use client';
import ProductBox from '@/components/shared/ProductBox';
import { useTebex } from '@/hooks/use-tebex';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { trpc } from '@/trpc';

const ForYou = () => {
  const [isMounted, setIsMounted] = useState(false);
  const { getCategoryList, showItemType } = useTebex();

  const categoryList = getCategoryList();

  useEffect(() => setIsMounted(true), []);

  const products = categoryList.map((entry) => entry.packages).flat();
  const productIds = categoryList.map((entry) => entry.packages.map((item) => item.id)).flat();

  const { data: topPicks, isLoading: isApiLoading } = trpc.getTopPicks.useQuery(
    { activeProducts: productIds, game: showItemType === 'ase' ? 'ase' : showItemType === 'asa' ? 'asa' : 'all' },
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
        <motion.h3
          initial={{
            x: 100,
            opacity: 0,
          }}
          whileInView={{
            x: 0,
            opacity: 1,
          }}
          viewport={{ once: true }}
          className="font-semibold text-2xl md:text-2xl text-primary"
        >
          For You
        </motion.h3>
        <motion.p
          initial={{
            x: 100,
            opacity: 0,
          }}
          whileInView={{
            x: 0,
            opacity: 1,
          }}
          viewport={{ once: true }}
          className="text-muted-foreground text-sm"
        >
          Click on an image to see the full description
        </motion.p>
      </div>
      <div className="flex gap-6 md:gap-12 justify-center sm:justify-start flex-wrap">
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

'use client';
import ProductBox from '@/components/shared/ProductBox';
import { useEffect, useMemo, useState } from 'react';
import { useTebex } from '@/hooks/use-tebex';
import { trpc } from '@/trpc';

const ForYou = () => {
  const { categoryList } = useTebex();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  const products = categoryList.map((entry) => entry.packages).flat();
  const productIds = categoryList.map((entry) => entry.packages.map((item) => item.id)).flat();

  const { data, isLoading: isApiLoading } = trpc.getTopPicks.useQuery(
    { activeProducts: productIds },
    {
      retry: false,
      refetchOnWindowFocus: false,
      enabled: isMounted,
    },
  );

  const isLoading = isApiLoading || !isMounted;

  const topPicks = useMemo(() => {
    if (!data) return [];
    const TOP_PICKS_TO_GENERATE = 4;
    let randomPicksToGenerate = 4;
    const _topPicks: number[] = [];
    data.forEach((entry) => {
      if (_topPicks.length < TOP_PICKS_TO_GENERATE) {
        _topPicks.push(entry);
      }
    });

    const matchedProducts = data?.length;
    const needProducts = matchedProducts < TOP_PICKS_TO_GENERATE;

    if (needProducts) {
      const extraProducts = products.filter((product) => !_topPicks.includes(product.id));
      while (extraProducts.length >= 1) {
        const randomProduct = extraProducts[Math.floor(Math.random() * extraProducts.length)];
        if (!_topPicks.includes(randomProduct.id)) _topPicks.push(randomProduct.id);
        if (_topPicks.length >= TOP_PICKS_TO_GENERATE) break;
      }
    }

    while (randomPicksToGenerate) {
      const extraProducts = products.filter((product) => !_topPicks.includes(product.id));
      if (!extraProducts || extraProducts.length <= 0) break;
      const randomProduct = extraProducts[Math.floor(Math.random() * extraProducts.length)];
      if (!_topPicks.includes(randomProduct.id)) {
        _topPicks.push(randomProduct.id);
        randomPicksToGenerate--;
      }
    }

    return _topPicks;
  }, [data]);

  if (!isLoading && !data) return null;

  return (
    <div>
      <h1 className="font-semibold text-xl md:text-2xl text-primary mb-2">For You</h1>
      <div
        className="grid grid-cols-1 space-y-12 smb:space-y-0 smb:gap-y-12 md:gap-y-0
        md:grid-cols-2 lg:gap-x-12  2xl:grid-cols-3 3xl:grid-cols-4 2xl:gap-6 smb:grid-cols-2"
      >
        {isLoading
          ? [...Array.from(Array(8).keys())].map((index) => <ProductBox.Skeleton key={`${index}-skeleton`} />)
          : topPicks.map((productId) => {
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

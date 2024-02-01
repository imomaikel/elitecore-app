'use client';
import { Button } from '@/shared/components/ui/button';
import { CgSpinnerTwoAlt } from 'react-icons/cg';
import ProductShowcase from './ProductShowcase';
import LandingWrapper from './LandingWrapper';
import { FaShopify } from 'react-icons/fa';
import { useAnimate } from 'framer-motion';
import { cn } from '@/shared/lib/utils';
import { useState } from 'react';
import { trpc } from '@/trpc';

const Shop = () => {
  const [ref, animate] = useAnimate();
  const {
    data: products,
    refetch,
    isRefetching,
  } = trpc.getRandomProducts.useQuery(undefined, {
    refetchOnWindowFocus: false,
    retry: 2,
  });
  const [hover, setHover] = useState(false);

  const changeProducts = async () => {
    await animate(ref.current, { opacity: 0 });

    refetch().then(() => animate(ref.current, { opacity: 1 }));
  };

  return (
    <div
      className="w-full pt-24 mb-24 md:mt-24 xl:mt-0 pb-3 relative px-5 rounded-md"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="absolute w-screen h-full inset-0 left-1/2 -translate-x-1/2 bg-white/5" />
      <div className={cn('absolute h-full lg:w-[560px] bottom-0 -left-9', hover && 'h-[632px]')} />
      <div className="flex flex-col-reverse lg:flex-row justify-end lg:mr-6 xl:mr-0 xl:justify-center lg:space-x-6 xl:space-x-16">
        <div ref={ref}>{products && <ProductShowcase products={products} hover={hover} />}</div>
        <LandingWrapper
          title="Our"
          colorTitle="shop"
          buttonLink="/dashboard"
          description="Welcome to our gaming paradise! Elevate your gameplay with exclusive in-game items and perks available in
          our shop. Top players and participants in special events stand a chance to win gift cards, unlocking a
          world of rewards. Dive in, play, and triumph in style – explore our shop now!"
          buttonText={
            <>
              Visit the shop <FaShopify className="h-6 w-6 ml-2" />
            </>
          }
          extraButton={
            <Button
              size="sm"
              variant="secondary"
              disabled={isRefetching}
              onClick={changeProducts}
              className="w-[120px]"
            >
              {isRefetching ? <CgSpinnerTwoAlt className="animate-spin h-4 w-4" /> : 'Change products'}
            </Button>
          }
        />
      </div>
      <div className="absolute w-[350px] h-[100px] bg-gradient-to-l from-yellow-600 to-red-600 inset-0 rotate-45 blur-[150px] opacity-75 -z-10" />
      <div className="absolute w-[300px] h-[100px] bg-gradient-to-r from-yellow-600 to-red-600 right-0 top-1/3 rotate-45 blur-[200px] opacity-75" />
      <div className="absolute bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 w-[300px] h-[200px] right-1/3 top-0 -z-10 blur-[200px]" />
    </div>
  );
};

export default Shop;

'use client';
import { Button } from '@/shared/components/ui/button';
import { motion, useAnimate } from 'framer-motion';
import { CgSpinnerTwoAlt } from 'react-icons/cg';
import { itemSlide } from '@/shared/lib/animate';
import ProductShowcase from './ProductShowcase';
import { FaShopify } from 'react-icons/fa';
import { cn } from '@/shared/lib/utils';
import { useState } from 'react';
import { trpc } from '@/trpc';
import Link from 'next/link';

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
      className="w-full py-24 relative px-5 rounded-md"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="absolute w-screen h-full inset-0 left-1/2 -translate-x-1/2 bg-white/5" />
      <div className={cn('absolute h-full md:w-[560px] bottom-0 -left-9', hover && 'h-[632px]')} />
      <div className="flex flex-col-reverse md:flex-row justify-center md:space-x-16">
        <div ref={ref}>{products && <ProductShowcase products={products} hover={hover} />}</div>
        <div className="mt-4 md:mt-0 relative z-10">
          <motion.div
            variants={itemSlide(0, -100)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-3xl space-x-2"
          >
            Our <span className="px-2 bg-primary rounded-md">shop</span>
          </motion.div>
          <motion.div
            variants={itemSlide(0, 100)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="max-w-md mt-4 text-justify"
          >
            <span>
              Welcome to our gaming paradise! Elevate your gameplay with exclusive in-game items and perks available in
              our shop. Top players and participants in special events stand a chance to win gift cards, unlocking a
              world of rewards. Dive in, play, and triumph in style – explore our shop now!
            </span>
          </motion.div>
          <motion.div
            variants={itemSlide(0, -100)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="mt-2 flex items-center space-x-2"
          >
            <Button asChild className="w-1/2 text-black">
              <Link href="/dashboard" target="_blank">
                Visit the shop
                <FaShopify className="h-6 w-6 ml-2" />
              </Link>
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={isRefetching}
              onClick={changeProducts}
              className="w-[120px]"
            >
              {isRefetching ? <CgSpinnerTwoAlt className="animate-spin h-4 w-4" /> : 'Change products'}
            </Button>
          </motion.div>
        </div>
      </div>
      <div className="absolute w-[350px] h-[100px] bg-gradient-to-l from-yellow-600 to-red-600 inset-0 rotate-45 blur-[150px] opacity-75 -z-10" />
      <div className="absolute w-[300px] h-[100px] bg-gradient-to-r from-yellow-600 to-red-600 right-0 top-1/3 rotate-45 blur-[200px] opacity-75" />
    </div>
  );
};

export default Shop;

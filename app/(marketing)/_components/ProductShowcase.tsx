'use client';
import { useAnimate } from 'framer-motion';
import { useEffect, useRef } from 'react';
import Product from './Product';

type TProductShowcase = {
  products: {
    name: string;
    image: string | null;
    id: number;
    basePrice: number;
  }[];
  hover: boolean;
};
const ProductShowcase = ({ products, hover }: TProductShowcase) => {
  const [ref, animate] = useAnimate();
  const stateRef = useRef(false);

  const collapse = () => {
    // @ts-expect-error type error
    animate('div#product-2', { top: '74px', translateX: '-40px' });
    // @ts-expect-error type error
    animate('div#product-3', { top: '42px', translateX: '-80px' });
    // @ts-expect-error type error
    animate('div#product-4', { top: '10px', translateX: '-120px' });
  };

  useEffect(() => {
    if (window.innerWidth < 1024) return;
    if (stateRef.current === true) return;
    stateRef.current = true;

    if (hover) {
      // @ts-expect-error type error
      animate('div#product-4', { top: '96px', translateX: '-260px' });
      // @ts-expect-error type error
      animate('div#product-3', { top: '-200px', translateX: '-260px' });
      // @ts-expect-error type error
      animate('div#product-2', { top: '-200px', translateX: '0px' });
    } else {
      collapse();
    }
    stateRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hover]);

  useEffect(() => {
    if (window.innerWidth > 1024) {
      collapse();
      return;
    }
    // @ts-expect-error type error
    animate('div#product-2', { top: '0px', translateX: '0px' }, { duration: 0 });
    // @ts-expect-error type error
    animate('div#product-3', { top: '0px', translateX: '0px' }, { duration: 0 });
    // @ts-expect-error type error
    animate('div#product-4', { top: '0px', translateX: '0px' }, { duration: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [window.innerWidth]);

  return (
    <div ref={ref} className="flex flex-wrap gap-4 lg:block lg:gap-0 mt-4 lg:mt-0">
      <Product product={products[0]} className="z-0" id="product-1" />
      <Product product={products[1]} className="lg:absolute lg:top-[74px] lg:-translate-x-10" id="product-2" />
      <Product product={products[2]} className="lg:absolute lg:top-[42px] lg:-translate-x-20" id="product-3" />
      <Product product={products[3]} className="lg:absolute lg:top-[10px] lg:-translate-x-[120px]" id="product-4" />
    </div>
  );
};

export default ProductShowcase;

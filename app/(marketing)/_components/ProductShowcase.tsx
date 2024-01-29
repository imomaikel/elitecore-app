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
    if (window.innerWidth < 768) return;
    if (stateRef.current === true) return;
    stateRef.current = true;

    if (hover) {
      // @ts-expect-error type error
      animate('div#product-4', { top: '106px', translateX: '-280px' });
      // @ts-expect-error type error
      animate('div#product-3', { top: '-210px', translateX: '-280px' });
      // @ts-expect-error type error
      animate('div#product-2', { top: '-210px', translateX: '0px' });
    } else {
      collapse();
    }
    stateRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hover]);

  useEffect(() => {
    if (window.innerWidth > 768) {
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
    <div ref={ref} className="md:mr-[260px] flex flex-wrap gap-1 sm:gap-4 md:block md:gap-0 mt-4 md:mt-0">
      <Product product={products[0]} className="md:absolute md:top-[106px] md:-translate-x-0" id="product-1" />
      <Product product={products[1]} className="md:absolute md:top-[74px] md:-translate-x-10" id="product-2" />
      <Product product={products[2]} className="md:absolute md:top-[42px] md:-translate-x-20" id="product-3" />
      <Product product={products[3]} className="md:absolute md:top-[10px] md:-translate-x-[120px]" id="product-4" />
    </div>
  );
};

export default ProductShowcase;

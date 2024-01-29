'use client';
import { useCurrency } from '@/hooks/use-currency';
import { cn } from '@/shared/lib/utils';
import Image from 'next/image';
import Link from 'next/link';

type TProduct = {
  product: {
    name: string;
    image: string | null;
    id: number;
    basePrice: number;
  };
  className?: string;
  id: string;
};
const Product = ({ product, className, id }: TProduct) => {
  const { formatPrice } = useCurrency();
  return (
    <Link href={`/dashboard/shop/${product.id}`}>
      <div
        className={cn(
          'w-[164px] md:w-[260px] border-2 hover:border-primary transition-colors cursor-pointer rounded-md relative',
          className,
        )}
        id={id}
      >
        <div className="relative z-10 w-40 h-40 md:w-64 md:h-64">
          <Image
            src={product.image ?? '/normal.png'}
            alt="product"
            width={0}
            height={0}
            sizes="100vw"
            className="h-full w-full object-cover object-center relative z-10 rounded-tr-md rounded-tl-md"
          />
        </div>
        <div className="relative z-10 font-semibold text-center my-1 space-x-2 flex items-center justify-center px-2 flex-col md:flex-row">
          <span className="text-muted-foreground truncate max-w-[100%] text-sm md:text-base md:max-w-[70%] inline-block">
            {product.name}
          </span>
          <span className="text-primary">{formatPrice(product.basePrice)}</span>
        </div>
        <div className="w-full h-full absolute inset-0 bg-background z-0 rounded-md" />
      </div>
    </Link>
  );
};

export default Product;

'use client';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { FaCartPlus, FaCircleInfo } from 'react-icons/fa6';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { useCurrency } from '@/hooks/use-currency';
import { useDialog } from '@/hooks/use-dialog';
import { useTebex } from '@/hooks/use-tebex';
import { ImSpinner9 } from 'react-icons/im';
import { cn } from '@/shared/lib/utils';
import { toast } from 'sonner';
import Image from 'next/image';
import { trpc } from '@/trpc';
import Link from 'next/link';

type TProductBox = {
  description: string;
  productId: number;
  basePrice: number;
  imageURL: string;
  name: string;
  gradient?: true;
};
const ProductBox = ({ basePrice, description, imageURL, name, productId, gradient }: TProductBox) => {
  const { onOpen: openDialog, setAuthUrl } = useDialog();
  const { addToBasket: clientAddToBasket } = useTebex();
  const { formatPrice } = useCurrency();
  const { mutate: addToBasket, isLoading } = trpc.addToBasket.useMutation({
    onSuccess: (response) => {
      if (response.status === 'success') {
        const basket = response.data;
        if (typeof basket === 'object') {
          const findProduct = basket.packages.find((product) => product.id === productId);
          if (findProduct) {
            clientAddToBasket(findProduct);
            toast.success(`Added "${findProduct.name}" to the cart!`);
          }
        }
      } else if (response.message === 'Basket not authorized') {
        setAuthUrl(response.errorMessage as string);
        openDialog();
      } else {
        toast.error(`Something went wrong! ${response.errorMessage ?? response.message}`);
      }
    },
    onError: () => {
      toast.error('Something went wrong!');
    },
  });

  // TODO: Price hook
  return (
    <div className="relative group transition-transform hover:-translate-y-3">
      {gradient && (
        <div className="bg-gradient-to-r from-orange-600 to-primary absolute h-[50%] w-[50%] opacity-50 blur-[125px] -rotate-[50deg] z-0" />
      )}
      {/* Image */}
      <Link href={`/dashboard/shop/${productId}`}>
        <div className="h-[225px] relative cursor-pointer">
          {isLoading ? (
            <div className="flex w-full h-full items-center justify-center">
              <ImSpinner9 className="w-[50%] h-[50%] animate-spin" />
            </div>
          ) : (
            <Image
              loading="eager"
              src={imageURL}
              alt="product"
              fill
              sizes="100vw"
              className="w-full h-full object-contain object-center"
            />
          )}
        </div>
      </Link>
      <div className="px-3 pb-2 pt-1.5">
        {/* Title */}
        <div className="font-bold tracking-wide group-hover:text-primary transition-colors">{name}</div>
        {/* Footer */}
        <div className="flex justify-between items-center">
          <span className="font-extrabold">{formatPrice(basePrice)}</span>
          <div className="flex mr-2 gap-x-4">
            <Popover>
              <PopoverTrigger>
                <FaCircleInfo className="h-8 w-8 cursor-pointer relative hover:text-primary transition-colors" />
              </PopoverTrigger>
              <PopoverContent className="max-h-[350px] overflow-y-auto">
                <div dangerouslySetInnerHTML={{ __html: description }} />
              </PopoverContent>
            </Popover>

            <FaCartPlus
              className={cn(
                'h-8 w-8 cursor-pointer hover:text-primary transition-colors z-10',
                isLoading && 'cursor-default',
              )}
              onClick={() => {
                if (!isLoading) addToBasket({ productId });
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

ProductBox.Skeleton = function ShowSkeleton() {
  return <Skeleton className="w-[275px] h-[300px]"></Skeleton>;
};
export default ProductBox;

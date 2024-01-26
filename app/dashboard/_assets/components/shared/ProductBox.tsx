'use client';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { FaCartPlus, FaCircleInfo } from 'react-icons/fa6';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { useCurrentUser } from '@/hooks/use-current-user';
import { usePathname, useRouter } from 'next/navigation';
import { useCurrency } from '@/hooks/use-currency';
import { useSheet } from '@/hooks/use-sheet';
import { useTebex } from '@/hooks/use-tebex';
import { ImSpinner9 } from 'react-icons/im';
import ActionDialog from './ActionDialog';
import { cn } from '@/shared/lib/utils';
import { useState } from 'react';
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
  const { addToBasket: clientAddToBasket, getCategoryList, setAuthUrl, authUrl } = useTebex();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { onOpen: openShoppingCart } = useSheet();
  const { formatPrice } = useCurrency();
  const { user } = useCurrentUser();
  const pathname = usePathname();
  const router = useRouter();

  const categoryList = getCategoryList();

  const { mutate: addToBasket, isLoading } = trpc.addToBasket.useMutation({
    onSuccess: (response) => {
      if (response.status === 'success') {
        const updatedBasket = response.data;
        if (typeof updatedBasket === 'object') {
          const findProduct = updatedBasket.packages.find(({ id }) => id === productId);

          if (findProduct) {
            clientAddToBasket(findProduct);
            toast.success(`Added "${findProduct.name}" to the cart!`);
            openShoppingCart();
          }
        }
      } else if (response.message === 'Basket not authorized') {
        setAuthUrl(response.errorMessage as string);
        setIsDialogOpen(true);
      } else {
        toast.error(`Something went wrong! ${response.errorMessage ?? response.message}`);
      }
    },
    onError: () => {
      toast.error('Something went wrong!');
    },
  });

  const onAdd = () => {
    if (user?.id) {
      if (!isLoading) addToBasket({ productId, pathname });
    } else {
      const product = categoryList
        .filter((category) => category.packages)
        .find((entry) => entry.packages.some((item) => item.id === productId))
        ?.packages.find(({ id }) => id === productId);
      if (product) {
        toast.success(`Added "${product.name}" to the cart!`);
        openShoppingCart();
        clientAddToBasket({
          description: product.description,
          id: product.id,
          in_basket: {
            gift_username: null,
            gift_username_id: null,
            price: product.base_price,
            quantity: 1,
          },
          name: product.name,
        });
      }
    }
  };

  return (
    <>
      <ActionDialog
        onOpenChange={() => setIsDialogOpen(!isDialogOpen)}
        onProceed={() => router.push(authUrl)}
        isOpen={isDialogOpen}
        title="Authentication needed!"
        description='Please click "Continue" to link your Steam account with your basket so we know where to send the package after purchase.'
      />
      <div className="relative group transition-all hover:!scale-105 max-w-[225px] hover:bg-black/60 rounded-lg">
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
                className="w-full h-full object-cover object-center rounded-lg"
              />
            )}
          </div>
        </Link>
        <div className="px-3 pb-2 pt-1.5">
          {/* Title */}
          <div className="font-bold tracking-wide group-hover:text-primary transition-colors">{name}</div>
          {/* Footer */}
          <div className="flex justify-between items-center">
            <div className="font-extrabold mr-3 w-[100px] h-6">{formatPrice(basePrice)}</div>
            <div className="flex mr-2 gap-x-4 relative">
              <Popover>
                <PopoverTrigger>
                  <FaCircleInfo className="h-7 w-7 cursor-pointer relative hover:text-primary transition-colors" />
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
                onClick={onAdd}
              />
              <div className="w-8 right-0 h-full absolute bg-orange-700/60 animate-pulse blur-[15px] z-0" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

ProductBox.Skeleton = function ShowSkeleton() {
  return <Skeleton className="w-[220px] h-[295px]" />;
};
export default ProductBox;

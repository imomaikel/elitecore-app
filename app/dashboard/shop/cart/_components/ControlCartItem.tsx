import { Basket, BasketPackage, Category, Package } from 'tebex_headless';
import ActionButton from '@/components/shared/ActionButton';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { useCurrency } from '@/hooks/use-currency';
import { useTebex } from '@/hooks/use-tebex';
import { useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { trpc } from '@/trpc';
import Link from 'next/link';

type TControlCartItem = {
  category: Category;
  basketItem: BasketPackage;
  productData: Package;
};
const ControlCartItem = ({ basketItem, category, productData }: TControlCartItem) => {
  const { removeFromBasket: clientRemoveFromBasket, setBasket, updatePrice } = useTebex();
  const { formatPrice } = useCurrency();
  const [quantity, setQuantity] = useState(basketItem.in_basket.quantity);

  const { mutate: removeFromBasket, isLoading: isRemoveLoading } = trpc.removeFromBasket.useMutation({
    onSuccess: (data) => {
      if (data.status === 'success') {
        clientRemoveFromBasket(basketItem.id);
        toast.success(`Removed "${basketItem.name}" from the cart!`);
      } else {
        toast.error(`Something went wrong! ${data.extraMessage ?? data.message}`);
      }
    },
    onError: () => {
      toast.error('Something went wrong!');
    },
  });
  const { mutate: updateQuantity, isLoading: isUpdateQuantityLoading } = trpc.updateQuantity.useMutation({
    onSuccess: (data) => {
      if (data.status === 'success') {
        setBasket(data.data as Basket);
        updatePrice();
        toast.success(`Updated "${basketItem.name}" quantity!`);
      } else {
        toast.error(`Something went wrong! ${data.message}`);
      }
    },
    onError: () => {
      toast.error('Something went wrong!');
    },
  });

  const itemBasePrice = basketItem.in_basket.quantity * productData.base_price;
  const itemSalesTax = basketItem.in_basket.quantity * productData.sales_tax;
  const itemTotalPrice = itemBasePrice + itemSalesTax;

  return (
    <div className="max-w-2xl flex flex-col md:flex-row relative z-10">
      <div className="relative z-10 mx-auto">
        <Image
          src={productData.image ?? '/logo.png'}
          width={160}
          height={160}
          className="object-center object-contain rounded-md"
          loading="eager"
          alt="product"
        />
      </div>
      <div className="pl-3 z-10 relative flex w-full flex-col">
        {/* Header */}
        <div className="flex items-center w-full h-min justify-between flex-col md:flex-row">
          <div className="text-2xl tracking-wide font-bold truncate max-w-[400px]">{basketItem.name}</div>
          <div className="flex">
            <ActionButton
              variant="ghost"
              disabled={isRemoveLoading}
              onClick={() => removeFromBasket({ productId: basketItem.id })}
            >
              Remove
            </ActionButton>
            <div className="w-[1px] flex mx-2 my-2 bg-muted-foreground" />
            <Button asChild variant="ghost">
              <Link href={`/dashboard/shop/${basketItem.id}`}>View details</Link>
            </Button>
          </div>
        </div>
        {/* Body */}
        <span className="text-muted-foreground">({category.name})</span>
        <div className="flex justify-between md:my-auto my-2 items-center">
          <div className="flex flex-col w-min">
            <Label htmlFor="quantity">Quantity</Label>
            <div className="flex items-center">
              <Input
                id="quantity"
                type="number"
                className="text-xs h-8 w-[70px] mt-1"
                disabled={productData.disable_quantity}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
              />
              {!productData.disable_quantity && (
                <ActionButton
                  variant="ghost"
                  size="sm"
                  disabled={isUpdateQuantityLoading}
                  onClick={() => updateQuantity({ productId: basketItem.id, quantity })}
                  className="ml-2 mt-1"
                >
                  Update
                </ActionButton>
              )}
            </div>
          </div>
          {basketItem.in_basket.gift_username_id && (
            <div>
              <div className="flex flex-col text-center">
                <span>Buying as a gift for</span>
                <span>{basketItem.in_basket.gift_username}</span>
                <span>{basketItem.in_basket.gift_username_id}</span>
              </div>
            </div>
          )}
          <div className="flex flex-col text-sm">
            <div className="flex justify-between">
              <span>Base Price</span>
              <div className="w-[75px] text-right">{formatPrice(itemBasePrice)}</div>
            </div>
            <div className="flex justify-between">
              <span>Sales Tax</span>
              <div className="w-[75px] text-right">{formatPrice(itemSalesTax)}</div>
            </div>
            <div className="flex justify-between">
              <span>Total Price</span>
              <div className="w-[75px] text-right">{formatPrice(itemTotalPrice)}</div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-gradient-to-r from-purple-800 via-violet-900 to-purple-800 absolute z-0 w-[45%] h-[72%] -rotate-12 -top-2 -left-10 blur-[250px] opacity-60" />
      <div className="bg-gradient-to-r from-fuchsia-600 to-pink-600 absolute z-0 w-[30%] h-[60%] right-16 md:right-0 rotate-45 bottom-6 blur-[200px] opacity-50" />
    </div>
  );
};

ControlCartItem.Skeleton = function ShowSkeleton() {
  return (
    <div className="max-w-2xl flex flex-col md:flex-row relative z-10">
      <div className="relative z-10 mx-auto">
        <Skeleton className="w-36 h-36" />
      </div>
      <div className="pl-3 z-10 relative flex w-full flex-col">
        <div className="flex items-center w-full h-min justify-between flex-col md:flex-row">
          <Skeleton className="w-48 h-8 md:my-0 mt-2" />
          <div className="flex">
            <Skeleton className="w-20 h-9 mx-1 my-1" />
            <Skeleton className="w-28 h-9 mx-1 my-1" />
          </div>
        </div>
        <Skeleton className="w-20 h-6" />
        <div className="flex justify-between md:my-auto my-2 items-center">
          <div className="flex flex-col w-min">
            <Skeleton className="w-20 h-3 my-1" />
            <div className="flex items-center">
              <Skeleton className="w-20 h-8 my-1" />
            </div>
          </div>
          <div className="flex flex-col text-sm">
            <div className="flex justify-between">
              <Skeleton className="w-16 h-5 my-0.5" />
              <Skeleton className="w-8 h-5 my-0.5 ml-1" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="w-14 h-5 my-0.5" />
              <Skeleton className="w-8 h-5 my-0.5 ml-1" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="w-16 h-5 my-0.5" />
              <Skeleton className="w-8 h-5 my-0.5 ml-1" />
            </div>
          </div>
        </div>
      </div>
      <div className="bg-gradient-to-r from-purple-800 via-violet-900 to-purple-800 absolute z-0 w-[45%] h-[72%] -rotate-12 -top-2 -left-10 blur-[250px] opacity-60" />
      <div className="bg-gradient-to-r from-fuchsia-600 to-pink-600 absolute z-0 w-[30%] h-[60%] right-16 md:right-0 rotate-45 bottom-6 blur-[200px] opacity-50" />
    </div>
  );
};
export default ControlCartItem;

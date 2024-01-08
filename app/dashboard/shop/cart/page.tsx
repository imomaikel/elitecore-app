'use client';
import { Separator } from '@/shared/components/ui/separator';
import ActionButton from '@/components/shared/ActionButton';
import ControlCartItem from './_components/ControlCartItem';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { useCurrency } from '@/hooks/use-currency';
import { useTebex } from '@/hooks/use-tebex';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { trpc } from '@/trpc';
import Link from 'next/link';

const CartPage = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [giftCard, setGiftCard] = useState('');
  const { basket, categoryList, applyGiftCard: clientApplyGiftCard, removeGiftCard: clientRemoveGiftCard } = useTebex();
  const { formatPrice } = useCurrency();
  const { data: session } = useSession();

  useEffect(() => setIsMounted(true), []);

  const { mutate: applyGiftCard } = trpc.applyGiftCard.useMutation({
    onSuccess: (data) => {
      if (data.status === 'success') {
        toast.success(data.message);
        clientApplyGiftCard(data.giftCard);
      } else {
        toast.error(`Something went wrong! ${data.message}`);
      }
    },
    onError: (data) => {
      toast.error(`Something went wrong! ${data.message ?? ''}`);
    },
  });
  const { mutate: removeGiftCard } = trpc.removeGiftCard.useMutation({
    onSuccess: (data) => {
      if (data.status === 'success') {
        toast.success(data.message);
        clientRemoveGiftCard(data.giftCard);
      } else {
        toast.error(`Something went wrong! ${data.message}`);
      }
    },
    onError: (data) => {
      toast.error(`Something went wrong! ${data.message ?? ''}`);
    },
  });

  if (!isMounted) {
    return (
      <div className="max-w-10xl flex">
        <div className="flex flex-col flex-1 space-y-8 relative z-10 mb-16">
          <div className="relative z-10 flex items-center space-x-6">
            <Skeleton className="w-40 h-10" />
            <Skeleton className="w-24 h-10" />
          </div>
          <div className="relative z-10">
            <Skeleton className="w-6 h-8 mb-2" />
            <div className="max-w-[250px] md:max-w-sm space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="w-28 h-6" />
                <div className="h-[1px] w-full bg-primary/40 mx-3" />
                <Skeleton className="w-3 h-6" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="w-24 h-6" />
                <div className="h-[1px] w-full bg-primary/40 mx-3" />
                <Skeleton className="w-24 h-6" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="w-20 h-6" />
                <div className="h-[1px] w-full bg-primary/40 mx-3" />
                <Skeleton className="w-16 h-6" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="w-28 h-6" />
                <div className="h-[1px] w-full bg-primary/40 mx-3" />
                <Skeleton className="w-28 h-6" />
              </div>
            </div>
          </div>
          <Separator />
          <div className="relative z-10">
            <Skeleton className="w-24 h-10" />
            <div>
              <Skeleton className="w-28 h-4 my-1" />
              <div className="flex md:space-y-0 space-y-3 md:space-x-3 flex-col md:flex-row">
                <Skeleton className="w-[75%] md:w-96 h-9" />
                <Skeleton className="w-16 h-9" />
              </div>
            </div>
          </div>
          <Separator />
          <div className="relative z-10">
            <Skeleton className="w-28 mb-2 h-8" />
            <div className="flex flex-col space-y-4">
              <ControlCartItem.Skeleton />
              <ControlCartItem.Skeleton />
            </div>
          </div>
          <div className="bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 absolute w-[110px] h-[250px] rotate-45 -top-12 left-8 z-0 blur-[200px]" />
        </div>
        <div className="fixed bottom-0 right-1 max-w-10xl">
          <div className="h-80 w-80 relative select-none z-10">
            <Image
              src="/cart.png"
              alt="cart"
              fill
              className="h-80 w-80 object-contain object-center -scale-x-100 opacity-25 md:opacity-100"
            />
            <div className="bg-gradient-to-l from-yellow-600 to-red-600 w-[50%] h-full absolute rotate-45 -top-5 right-28 blur-[300px]  opacity-60" />
          </div>
        </div>
      </div>
    );
  }

  const totalItems = basket?.packages.length;
  const basePrice = formatPrice(basket?.base_price ?? 0);
  const salesTax = formatPrice(basket?.sales_tax ?? 0);
  const totalPrice = formatPrice(basket?.total_price ?? 0);

  return (
    <div className="max-w-10xl flex">
      <div className="flex flex-col flex-1 space-y-8 relative z-10 mb-16">
        {/* Header */}
        <div className="relative z-10 flex items-center space-x-6">
          <h1 className="text-4xl tracking-wide font-bold">Your Cart</h1>
          <Button asChild>
            <Link href={`https://checkout.tebex.io/checkout/${session?.user.basketIdent}`}>CHECKOUT</Link>
          </Button>
        </div>
        <div className="relative z-10">
          <h2 className="font-medium text-xl mb-2 tracking-wide">Summary</h2>
          <div className="max-w-[250px] md:max-w-sm space-y-2">
            <div className="flex items-center justify-between">
              <div className="whitespace-nowrap">Total Items</div>
              <div className="h-[1px] w-full bg-primary/40 mx-4" />
              <div>{totalItems}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="whitespace-nowrap">Base Price</div>
              <div className="h-[1px] w-full bg-primary/40 mx-4" />
              <div>{basePrice}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="whitespace-nowrap">Sales Tax</div>
              <div className="h-[1px] w-full bg-primary/40 mx-4" />
              <div>{salesTax}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="whitespace-nowrap">Total Price</div>
              <div className="h-[1px] w-full bg-primary/40 mx-4" />
              <div className="font-extrabold">{totalPrice}</div>
            </div>
          </div>
        </div>
        <Separator />
        {/* Coupons */}
        <div className="relative z-10">
          <h2 className="font-medium text-xl mb-2 tracking-wide">Gift Card</h2>
          <div>
            <Label htmlFor="coupon">Redeem Gift Card</Label>
            <div className="flex md:space-y-0 space-y-3 md:space-x-3 flex-col md:flex-row">
              <Input
                id="coupon"
                className="max-w-sm"
                placeholder="Enter a gift card if you have one"
                value={giftCard}
                onChange={(e) => setGiftCard(e.target.value)}
              />
              <ActionButton
                variant="secondary"
                onClick={() => applyGiftCard({ giftCard: giftCard.replace(/ /gi, '') })}
              >
                Check
              </ActionButton>
            </div>
            {basket?.giftcards && basket?.giftcards?.length >= 1 && (
              <div className="mt-4">
                <div className="font-medium tracking-wide text-lg">Added Gift Cards</div>
                <ol>
                  {basket.giftcards.map(({ card_number: code }) => (
                    <li key={code} className="flex items-center">
                      <span>{code}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="ml-4"
                        onClick={() => removeGiftCard({ giftCard: code.toString() })}
                      >
                        Remove
                      </Button>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </div>
        <Separator />
        {/* Products */}
        <div className="relative z-10">
          <h2 className="font-medium text-xl mb-4 tracking-wide">Products</h2>
          <div className="flex flex-col space-y-10">
            {basket?.packages.map((item) => {
              const categoryData = categoryList.find((category) =>
                category.packages.find((entry) => entry.id === item.id),
              );
              const productData = categoryData?.packages.find((entry) => entry.id === item.id);
              if (!categoryData || !productData) return null;

              return (
                <ControlCartItem key={item.id} basketItem={item} category={categoryData} productData={productData} />
              );
            })}
          </div>
        </div>
        <div className="bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 absolute w-[110px] h-[250px] rotate-45 -top-12 left-8 z-0 blur-[200px]" />
      </div>
      <div className="fixed bottom-0 right-1 max-w-10xl">
        <div className="h-80 w-80 relative select-none z-10">
          <Image
            src="/cart.png"
            alt="cart"
            fill
            className="h-80 w-80 object-contain object-center -scale-x-100 opacity-25 md:opacity-100"
          />
          <div className="bg-gradient-to-l from-yellow-600 to-red-600 w-[50%] h-full absolute rotate-45 -top-5 right-28 blur-[300px] opacity-60" />
        </div>
      </div>
    </div>
  );
};

export default CartPage;

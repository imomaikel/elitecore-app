'use client';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/shared/components/ui/sheet';
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert';
import { useCurrentUser } from '@/hooks/use-current-user';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/shared/components/ui/button';
import { useCurrency } from '@/hooks/use-currency';
import GiftCardApplied from './GiftCardApplied';
import { FaDollarSign } from 'react-icons/fa6';
import { useTebex } from '@/hooks/use-tebex';
import CheckoutButton from './CheckoutButton';
import { usePrice } from '@/hooks/use-price';
import { useSheet } from '@/hooks/use-sheet';
import { useEffect, useState } from 'react';
import SignInConfirm from './SignInConfirm';
import ActionDialog from './ActionDialog';
import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import CartItem from './CartItem';
import { toast } from 'sonner';
import Image from 'next/image';
import { trpc } from '@/trpc';

const WEBSTORE_IDENTIFIER = process.env.NEXT_PUBLIC_TEBEX_WEBSTORE_IDENTIFIER;
const BASE_URL = process.env.NEXT_PUBLIC_TEBEX_BASE_URL;

const ShoppingCart = () => {
  const { categoryList, setBasket, basket, fetched, setFetched } = useTebex();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDataReady, setIsDataReady] = useState(false);
  const { sessionStatus, user } = useCurrentUser();
  const { isOpen, onOpenChange } = useSheet();
  const { formatPrice } = useCurrency();
  const { updatePrice } = usePrice();
  const pathname = usePathname();
  const router = useRouter();

  const { mutate: addToBasket } = trpc.addToBasket.useMutation();

  useEffect(() => {
    if (sessionStatus !== 'authenticated' || !user || !user.basketIdent) {
      setIsDataReady(true);
      return;
    }
    if (!fetched) {
      basket.packages.forEach((item) => {
        for (let i = 0; i < item.in_basket.quantity; i++) {
          addToBasket(
            {
              pathname,
              productId: item.id,
            },
            {
              onSuccess: () => {
                if (!fetched) setFetched();
              },
            },
          );
        }
      });
      toast.info('Your basket has been updated!', { duration: 10_000 });
      return;
    }
    const url = `${BASE_URL}/api/accounts/${WEBSTORE_IDENTIFIER}/baskets/${user.basketIdent}`;
    fetch(url, { method: 'GET' })
      .then((res) => res.json())
      .then((response) => {
        setBasket(response.data);
        setIsDataReady(true);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionStatus]);

  useEffect(() => {
    updatePrice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isDataReady) return;

  return (
    <>
      <ActionDialog
        onOpenChange={() => setIsDialogOpen(!isDialogOpen)}
        onProceed={() => signIn('discord')}
        isOpen={isDialogOpen}
        title="Disclaimer"
        description={<SignInConfirm />}
      />
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent className="overflow-y-auto overflow-x-hidden">
          <SheetHeader>
            <SheetTitle className="mb-2">Your cart ({basket?.packages.length ?? 0})</SheetTitle>
          </SheetHeader>

          <div className="relative">
            {basket?.packages?.length >= 1 && (
              <div className="bg-gradient-to-r from-red-800 via-yellow-600 to-yellow-500 absolute h-80 w-[30%] right-28 -rotate-45 opacity-75 blur-[175px] z-0" />
            )}
            <div className="relative">
              {!basket || basket.packages.length <= 0 ? (
                <motion.div
                  className="flex flex-col select-none"
                  initial={{ x: 200 }}
                  whileInView={{ x: 0 }}
                  viewport={{ once: false }}
                  transition={{
                    type: 'spring',
                  }}
                >
                  <div className="w-full h-[350px] md:h-[425px]">
                    <Image src="/shop/emptyCart.webp" fill alt="empty cart" className="mt-4" />
                  </div>
                  <motion.span
                    initial={{ opacity: 0 }}
                    viewport={{ once: false }}
                    whileInView={{ opacity: 1 }}
                    className="font-bold text-center text-xl translate-y-4"
                  >
                    Your cart is empty!
                  </motion.span>
                </motion.div>
              ) : (
                <div>
                  <div className="space-x-4 z-10 relative">
                    <CheckoutButton onClick={() => setIsDialogOpen(true)} />
                    <Button
                      variant="ghost"
                      onClick={() => {
                        onOpenChange();
                        router.push('/dashboard/shop/cart');
                      }}
                    >
                      View details
                    </Button>
                  </div>
                  <div className="my-4">
                    <div className="flex justify-between items-center font-medium">
                      <span>Base price:</span>
                      <div className="h-[1px] flex-1 bg-primary/40 mx-4"></div>
                      <span>{formatPrice(basket.base_price)}</span>
                    </div>
                    <div className="flex justify-between items-center font-medium">
                      <span>Tax:</span>
                      <div className="h-[1px] flex-1 bg-primary/40 mx-4"></div>
                      <span>{formatPrice(basket.sales_tax)}</span>
                    </div>
                    <div className="flex justify-between items-center font-medium">
                      <span>Total price:</span>
                      <div className="h-[1px] flex-1 bg-primary/40 mx-4"></div>
                      <span>{formatPrice(basket.total_price)}</span>
                    </div>
                    {basket.giftcards.length >= 1 && <GiftCardApplied className="my-4" />}
                    <Alert className="my-2 z-10 relative">
                      <div className="bg-gradient-to-r from-red-500 to-red-800 w-[75%] h-[50%] left-[50%] -translate-x-[50%]  blur-[150px] absolute top-0 opacity-75 z-0" />
                      <FaDollarSign className="h-4 w-4" />
                      <AlertTitle className="z-10 relative">Heads up!</AlertTitle>
                      <AlertDescription className="text-xs relative z-10">
                        Please note that currency exchange rates may cause slight adjustments to your order total at
                        checkout. We aim for transparency and assure you any changes will be minimal.
                      </AlertDescription>
                    </Alert>
                  </div>
                  <div className="z-10 relative">
                    {basket?.packages?.map((basketItem, index) => {
                      const productData = categoryList
                        .find((category) => category.packages.find((entry) => entry.id === basketItem.id))
                        ?.packages.find((entry) => entry.id === basketItem.id);
                      return (
                        <CartItem key={`${basketItem.id}${index}`} basketItem={basketItem} productItem={productData} />
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 absolute h-80 w-[30%] right-28 -rotate-45 opacity-75 bottom-0 blur-[175px] z-0" />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default ShoppingCart;

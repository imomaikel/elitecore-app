'use client';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/shared/components/ui/sheet';
import { useEffect, useState } from 'react';
import { useCart } from '@/hooks/use-cart';
import { useBasket } from '@/hooks/use-basket';
import Loader from './Loader';

const ShoppingCart = () => {
  const { isOpen, onOpenChange } = useCart();
  const [isMounted, setIsMounted] = useState(false);
  const { basketData, isBasketLoading } = useBasket();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || isBasketLoading) return;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Your cart</SheetTitle>
          {isBasketLoading ? (
            <Loader />
          ) : basketData ? (
            basketData.packages?.map((product) => <p key={product.id}>{product.name}</p>)
          ) : (
            'Fail'
          )}
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};

export default ShoppingCart;

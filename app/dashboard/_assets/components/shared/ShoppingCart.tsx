'use client';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/shared/components/ui/sheet';
import { useEffect, useState } from 'react';
import { useCart } from '@/hooks/use-cart';

const ShoppingCart = () => {
  const { isOpen, onOpenChange } = useCart();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Your cart</SheetTitle>
          <SheetDescription>Empty</SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};

export default ShoppingCart;

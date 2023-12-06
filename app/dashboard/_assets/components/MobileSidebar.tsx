'use client';
import { Sheet, SheetContent } from '@/shared/components/ui/sheet';
import { useMobileSidebar } from '@/hooks/use-mobile-sidebar';
import { useEffect, useState } from 'react';
import Sidebar from './Sidebar';

const MobileSidebar = () => {
  const { isOpen, onClose } = useMobileSidebar();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left">
        <Sidebar className="flex w-full border-none mt-5" />
      </SheetContent>
    </Sheet>
  );
};

export default MobileSidebar;

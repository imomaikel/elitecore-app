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
      <SheetContent side="left" className="overflow-y-auto p-0">
        <div className="flex w-full min-h-[calc(100%-48px)] mt-12">
          <Sidebar className="flex w-full border-none shadow-none md:shadow-none m-0" />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileSidebar;

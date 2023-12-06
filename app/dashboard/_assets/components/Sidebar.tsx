'use client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Separator } from '@/shared/components/ui/separator';
import { useSidebarTab } from '@/hooks/use-sidebar-tab';
import React, { useEffect, useState } from 'react';
import { cn } from '@/shared/lib/utils';
import PanelTab from './PanelTab';
import ShopTab from './ShopTab';

type TSidebar = {
  className?: string;
};
const Sidebar = ({ className }: TSidebar) => {
  const { selected, setTab } = useSidebarTab();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className={cn('w-[330px] mt-16 md:flex hidden relative border-primary/20 border-r', className)}>
      {/* <div className="absolute w-full h-[1px] bg-background z-10 -top-[1px]" /> */}
      <div className="p-4 w-full">
        <Tabs
          defaultValue="shop"
          value={isMounted ? selected : 'loading'}
          onValueChange={(state) => {
            if (state === 'shop' || (state === 'panel' && isMounted)) {
              setTab(state);
            }
          }}
          className="w-[calc(330px - 32px)]"
        >
          <TabsList className="w-full flex gap-x-6 mb-4">
            <TabsTrigger value="shop" onClick={() => setTab('shop')}>
              Shop
            </TabsTrigger>
            <TabsTrigger value="panel" onClick={() => setTab('panel')}>
              Panel
            </TabsTrigger>
          </TabsList>
          <TabsContent value="shop">
            <ShopTab />
          </TabsContent>
          <TabsContent value="panel">
            <PanelTab />
          </TabsContent>
          <TabsContent value="loading">
            <div className="flex flex-col gap-y-2">
              <Skeleton className="px-2 text-muted-foreground text-justify h-12" />

              <Skeleton className="px-2 py-2 w-full rounded-sm truncate cursor-pointer transition-colors hover:bg-primary hover:underline h-10" />
              <Skeleton className="px-2 py-2 w-full rounded-sm truncate cursor-pointer transition-colors hover:bg-primary hover:underline h-10" />
              <Skeleton className="px-2 py-2 w-full rounded-sm truncate cursor-pointer transition-colors hover:bg-primary hover:underline h-10" />
              <Skeleton className="px-2 py-2 w-full rounded-sm truncate cursor-pointer transition-colors hover:bg-primary hover:underline h-10" />
              <Skeleton className="px-2 py-2 w-full rounded-sm truncate cursor-pointer transition-colors hover:bg-primary hover:underline h-10" />
              <Skeleton className="px-2 py-2 w-full rounded-sm truncate cursor-pointer transition-colors hover:bg-primary hover:underline h-10" />
            </div>
          </TabsContent>
        </Tabs>
        <Separator className="my-4 bg-primary/20" />
      </div>
    </div>
  );
};

export default Sidebar;

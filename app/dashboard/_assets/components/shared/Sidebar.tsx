'use client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Separator } from '@/shared/components/ui/separator';
import { useSidebarTab } from '@/hooks/use-sidebar-tab';
import React, { useEffect, useState } from 'react';
import { cn } from '@/shared/lib/utils';
import PanelTab from './PanelTab';
import ShopTab from './ShopTab';
import Link from 'next/link';

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
    <div
      className={cn(
        'w-[310px] mt-16 md:flex flex-col hidden relative shadow-md md:shadow-lg md:shadow-black/90 justify-between',
        className,
      )}
    >
      <div className="p-4 w-full">
        <Tabs
          defaultValue="shop"
          value={isMounted ? selected : 'shop'}
          onValueChange={(state) => {
            if (state === 'shop' || (state === 'panel' && isMounted)) {
              setTab(state);
            }
          }}
          className="w-[calc(310px - 32px)]"
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
        </Tabs>
        <Separator className="my-4 bg-primary/20" />
      </div>
      <div className="text-muted-foreground/75 flex flex-col px-2 pt-4 mb-2 text-xs select-none">
        <p> &copy; 2024 EliteCore</p>
        <p>We do not have affiliation with any real world brands</p>
        <p>
          Website made by
          <Link
            href="https://github.com/imomaikel"
            className="underline ml-1 underline-offset-2 opacity-75"
            target="_blank"
          >
            imomaikel
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Sidebar;

'use client';
import { Separator } from '@/shared/components/ui/separator';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { usePathname } from 'next/navigation';
import { useTebex } from '@/hooks/use-tebex';
import { useEffect, useState } from 'react';
import { trpc } from '@/trpc';
import Link from 'next/link';

const ShopTab = () => {
  const { getCategoryList, setCategoryList } = useTebex();
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();

  const { data } = trpc.getCategories.useQuery(undefined, {
    refetchOnWindowFocus: false,
    retry: false,
  });

  const categoryList = getCategoryList();

  useEffect(() => {
    if (!isMounted) setIsMounted(true);
    if (data) setCategoryList(data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, isMounted]);

  return (
    <div className="flex flex-col gap-y-2">
      <div className="px-2 text-muted-foreground text-justify">
        Keep the server alive by purchasing some of our perks or packages
      </div>
      {pathname !== '/dashboard' && (
        <>
          <Link href="/dashboard">
            <div className="bg-primary/50 px-2 py-2 w-full rounded-sm truncate cursor-pointer transition-colors hover:bg-primary hover:underline text-sm">
              <span>Home</span>
            </div>
          </Link>
          <Separator className="my-2" />
        </>
      )}
      {isMounted ? (
        categoryList.map((category) => (
          <Link href={`/dashboard/shop/category/${category.id}`} key={category.id}>
            <div className="bg-primary/50 px-2 py-2 w-full rounded-sm truncate cursor-pointer transition-colors hover:bg-primary hover:underline text-sm">
              <span>{category.name}</span>
            </div>
          </Link>
        ))
      ) : (
        <div className="flex flex-col gap-y-2">
          <Skeleton className="px-2 text-muted-foreground text-justify h-12" />

          <Skeleton className="px-2 py-2 w-full rounded-sm truncate cursor-pointer transition-colors hover:bg-primary hover:underline h-10" />
          <Skeleton className="px-2 py-2 w-full rounded-sm truncate cursor-pointer transition-colors hover:bg-primary hover:underline h-10" />
          <Skeleton className="px-2 py-2 w-full rounded-sm truncate cursor-pointer transition-colors hover:bg-primary hover:underline h-10" />
          <Skeleton className="px-2 py-2 w-full rounded-sm truncate cursor-pointer transition-colors hover:bg-primary hover:underline h-10" />
          <Skeleton className="px-2 py-2 w-full rounded-sm truncate cursor-pointer transition-colors hover:bg-primary hover:underline h-10" />
          <Skeleton className="px-2 py-2 w-full rounded-sm truncate cursor-pointer transition-colors hover:bg-primary hover:underline h-10" />
        </div>
      )}
    </div>
  );
};

export default ShopTab;

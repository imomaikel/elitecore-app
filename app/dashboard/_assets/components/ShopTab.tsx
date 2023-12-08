'use client';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { useTebex } from '@/hooks/use-tebex';
import { useEffect, useState } from 'react';
import { trpc } from '@/trpc';
import Link from 'next/link';

const ShopTab = () => {
  const { categoryList, setCategoryList } = useTebex();
  const [isMounted, setIsMounted] = useState(false);

  const { mutate: fetchCategories } = trpc.getCategories.useMutation({
    onSuccess: (categories) => {
      if (categories) {
        setCategoryList(categories);
      }
    },
  });

  useEffect(() => {
    fetchCategories();
    setIsMounted(true);
  }, []);

  return (
    <div className="flex flex-col gap-y-2">
      <div className="px-2 text-muted-foreground text-justify">
        Keep the server alive by purchasing some of our perks or packages
      </div>
      {isMounted ? (
        categoryList.map((category) => (
          <Link href={`/dashboard/shop/category/${category.id}`} key={category.id}>
            <div className="bg-primary/50 px-2 py-2 w-full rounded-sm truncate cursor-pointer transition-colors hover:bg-primary hover:underline">
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

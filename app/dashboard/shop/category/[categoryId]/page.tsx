'use client';
import { Separator } from '@/shared/components/ui/separator';
import { Skeleton } from '@/shared/components/ui/skeleton';
import ProductBox from '@/components/shared/ProductBox';
import { redirect, useRouter } from 'next/navigation';
import { IoArrowBackOutline } from 'react-icons/io5';
import { useTebex } from '@/hooks/use-tebex';
import { useEffect, useState } from 'react';
type TParams = {
  params: {
    categoryId: string;
  };
};
const CategoryPage = ({ params }: TParams) => {
  const router = useRouter();
  const { categoryId } = params;
  const { categoryList } = useTebex();
  const [isMounted, setIsMounted] = useState(false);

  const numberCategoryId = parseInt(categoryId);

  if (isNaN(numberCategoryId)) {
    redirect('/dashboard');
  }

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const category = categoryList.find((entry) => entry.id === numberCategoryId);
  category?.packages.sort((a, b) => a.base_price - b.base_price);

  if (isMounted && !category) {
    redirect('/dashboard');
  }

  if (!isMounted) {
    return (
      <div className="max-w-10xl">
        <div className="mb-4">
          <Skeleton className="w-20 h-6 mb-2" />
          <div className="flex items-center">
            <Skeleton className="w-[400px] h-8" />
          </div>
          <Separator className="my-4" />
          <Skeleton className="w-full h-16" />
        </div>
        <div className="px-4 grid gap-16 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          <ProductBox.Skeleton />
          <ProductBox.Skeleton />
          <ProductBox.Skeleton />
          <ProductBox.Skeleton />
          <ProductBox.Skeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-10xl">
      <div className="mb-4">
        <p className="text-muted-foreground">You are viewing:</p>
        <div className="flex items-center">
          <h1 className="text-4xl tracking-wide font-bold">{category?.name}</h1>
          <div
            className="items-center text-muted-foreground ml-4 opacity-50 hover:opacity-100 transition-opacity hover:underline cursor-pointer flex"
            role="button"
            onClick={() => router.back()}
          >
            Go back
            <IoArrowBackOutline className="ml-1" />
          </div>
        </div>
        <Separator className="my-4" />
        {category?.description && <div dangerouslySetInnerHTML={{ __html: category.description }} />}
      </div>
      <div className="px-4 grid gap-16 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {category?.packages.map((categoryPackage) => (
          <ProductBox
            key={categoryPackage.id}
            basePrice={categoryPackage.total_price}
            description={categoryPackage.description}
            imageURL={categoryPackage.image ?? '/logo.png'}
            name={categoryPackage.name}
            productId={categoryPackage.id}
            gradient={true}
          />
        ))}
      </div>
    </div>
  );
};

export default CategoryPage;

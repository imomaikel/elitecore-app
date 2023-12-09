'use client';
import ProductBox from '@/components/shared/ProductBox';
import { useTebex } from '@/hooks/use-tebex';
import { useEffect, useState } from 'react';
import { redirect } from 'next/navigation';

type TParams = {
  params: {
    categoryId: string;
  };
};
const CategoryPage = ({ params }: TParams) => {
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

  return (
    <div>
      <div>
        <h1>{isMounted && category?.name}</h1>
        <p className="max-w-[300px]">{isMounted && category?.description}</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {isMounted ? (
          category?.packages.map((categoryPackage) => (
            <ProductBox
              key={categoryPackage.id}
              basePrice={categoryPackage.base_price}
              description={categoryPackage.description}
              imageURL={categoryPackage.image ?? '/logo.png'}
              name={categoryPackage.name}
              productId={categoryPackage.id}
            />
          ))
        ) : (
          <>
            <ProductBox.Skeleton />
            <ProductBox.Skeleton />
            <ProductBox.Skeleton />
            <ProductBox.Skeleton />
            <ProductBox.Skeleton />
          </>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;

'use client';
import ProductBox from '@/components/shared/ProductBox';
import React, { useEffect, useState } from 'react';
import { useTebex } from '@/hooks/use-tebex';
import { redirect } from 'next/navigation';

type TProductPage = {
  params: {
    productId: string;
  };
};
const ProductPage = ({ params }: TProductPage) => {
  const { categoryList } = useTebex();
  const [isMounted, setIsMounted] = useState(false);

  const { productId } = params;
  const numberProductId = parseInt(productId);

  if (isNaN(numberProductId)) {
    redirect('/dashboard');
  }

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const category =
    isMounted &&
    categoryList.filter((entry) => entry.packages.some((categoryPackage) => categoryPackage.id === numberProductId))[0];
  const product = isMounted && category && category.packages.find((entry) => entry.id === numberProductId);

  if (!product && isMounted) {
    redirect('/dashboard');
  }

  if (isMounted && product) {
    return (
      <ProductBox
        basePrice={product.base_price}
        description={product.description}
        imageURL={product.image ?? '/logo.png'}
        name={product.name}
        productId={product.id}
      />
    );
  }

  return <div>Loading</div>;
};

export default ProductPage;

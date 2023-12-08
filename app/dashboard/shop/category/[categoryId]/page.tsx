import ProductBox from '@/components/ProductBox';
import { shopGetCategory } from '@/shared/lib/tebex';
import { redirect } from 'next/navigation';

type TParams = {
  params: {
    categoryId: string;
  };
};
const CategoryPage = async ({ params }: TParams) => {
  const { categoryId } = params;

  const numberCategoryId = parseInt(categoryId);

  if (isNaN(numberCategoryId)) {
    redirect('/dashboard');
  }

  const category = await shopGetCategory(numberCategoryId);

  return (
    <div className="w-full grid grid-cols-3">
      {category?.packages.map((categoryPackage) => (
        <ProductBox
          key={categoryPackage.id}
          basePrice={categoryPackage.base_price}
          description={categoryPackage.description}
          imageURL={categoryPackage.image ?? ''}
          name={categoryPackage.name}
          productId={categoryPackage.id}
        />
      ))}
    </div>
  );
};

export default CategoryPage;

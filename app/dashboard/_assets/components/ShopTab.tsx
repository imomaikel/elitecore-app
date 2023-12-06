import { donationCategories } from '@/constans/test-data';
import Link from 'next/link';

const ShopTab = () => {
  return (
    <div className="flex flex-col gap-y-2">
      <div className="px-2 text-muted-foreground text-justify">
        Keep the server alive by purchasing some of our perks or packages
      </div>
      {donationCategories.map((category) => (
        <Link href={`/shop/categories/${category.id}`} key={category.id}>
          <div className="bg-primary/50 px-2 py-2 w-full rounded-sm truncate cursor-pointer transition-colors hover:bg-primary hover:underline">
            <span>{category.name}</span>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default ShopTab;

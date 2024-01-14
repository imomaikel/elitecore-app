'use client';
import TicketCard from './_components/TicketCard';
import { trpc } from '@/trpc';

const TicketCreatePage = () => {
  const { isLoading, data: categories } = trpc.getTicketCategories.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl  :grid-cols-3 2xl:grid-cols-4 gap-4">
        {isLoading
          ? 'Loading'
          : categories && categories.length >= 1
          ? categories.map((category, index) => (
              <TicketCard
                coordinateInput={category.coordinateInput}
                image={category.image}
                index={index}
                limit={category.limit}
                mapSelection={category.mapSelection}
                steamRequired={category.steamRequired}
                key={category.id}
                name={category.name}
                description={category.description}
                createConfirmation={category.createConfirmation}
                id={category.id}
              />
            ))
          : 'No categories'}
      </div>
    </div>
  );
};

export default TicketCreatePage;

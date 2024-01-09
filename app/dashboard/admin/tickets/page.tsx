'use client';
import ActionDialog from '@/components/shared/ActionDialog';
import { Button } from '@/shared/components/ui/button';
import CategoryCard from './_components/CategoryCard';
import AdminPageWrapper from '@/admin/PageWrapper';
import ItemInfo from '@/admin/ItemWrapper';
import { useRef, useState } from 'react';
import { trpc } from '@/trpc';
import Link from 'next/link';

const AdminTicketsPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const deleteId = useRef('');

  const { data: categories, isLoading, refetch } = trpc.admin.getTicketCategories.useQuery();
  const { mutate: deleteTicketCategory, isLoading: isDeleting } = trpc.admin.deleteTicketCategory.useMutation({
    onSuccess: () => refetch(),
  });

  const confirmDelete = (id: string) => {
    deleteId.current = id;
    setIsOpen(true);
  };

  return (
    <AdminPageWrapper title="Tickets">
      {/* Current categories */}
      <ItemInfo title="Current categories">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
          {isLoading ? (
            'Loading'
          ) : (
            <>
              {categories?.map(({ id, name }) => (
                <CategoryCard key={id} onDelete={() => confirmDelete(id)} id={id} name={name} isDeleting={isDeleting} />
              ))}
              <div className="bg-white/5 max-w-sm p-4 space-y-2 rounded-lg">
                <div className="text-xl font-medium w-full truncate">Add a new category</div>
                <Button className="w-full" asChild>
                  <Link href="/dashboard/admin/tickets/category/new">Click to add</Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </ItemInfo>

      {/* TODO */}
      {/* View Tickets */}
      <div></div>

      <ActionDialog
        description="Are you sure? This action is irreversible."
        isOpen={isOpen}
        onOpenChange={() => setIsOpen(!isOpen)}
        onProceed={() => {
          deleteTicketCategory({ id: deleteId.current });
        }}
        title="Confirm deletion"
        proceedLabel="Delete!"
      />
    </AdminPageWrapper>
  );
};

export default AdminTicketsPage;

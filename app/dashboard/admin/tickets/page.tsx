'use client';
import ActionDialog from '@/components/shared/ActionDialog';
import { useCurrentUser } from '@/hooks/use-current-user';
import { Button } from '@/shared/components/ui/button';
import CategoryCard from './_components/CategoryCard';
import { useEffect, useRef, useState } from 'react';
import AdminPageWrapper from '@/admin/PageWrapper';
import ChannelPicker from '@/admin/ChannelPicker';
import { useRouter } from 'next/navigation';
import ItemInfo from '@/admin/ItemWrapper';
import { toast } from 'sonner';
import { trpc } from '@/trpc';
import Link from 'next/link';

const AdminTicketsPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useCurrentUser();
  const deleteId = useRef('');
  const router = useRouter();

  // TODO
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true));
  if (!isMounted) return;

  if (!user?.selectedGuildId) {
    router.push('/dashboard/admin/discord-selection');
    return;
  }

  const { mutate: updateWidgetChannel, isLoading: isWidgetUpdating } = trpc.admin.updateWidget.useMutation();
  const { data: categories, isLoading, refetch } = trpc.admin.getTicketCategories.useQuery();
  const { mutate: deleteTicketCategory, isLoading: isDeleting } = trpc.admin.deleteTicketCategory.useMutation({
    onSuccess: () => {
      toast.success('Deleted!');
      refetch();
    },
  });

  const confirmDelete = (id: string) => {
    deleteId.current = id;
    setIsOpen(true);
  };

  return (
    <AdminPageWrapper title="Tickets">
      {/* Channel Picker */}
      <ItemInfo
        title="Ticket Channel"
        description="This is the channel where the widget with categories and buttons is located."
      >
        <ChannelPicker
          type="TEXT"
          guildId={user?.selectedGuildId}
          isLoading={isWidgetUpdating}
          onSelect={(channelId) => {
            if (!channelId) return;
            updateWidgetChannel(
              { channelId, widgetName: 'ticketWidget' },
              {
                onSuccess: (response) => {
                  if (response?.status === 'error') {
                    toast.error(`Something went wrong! ${response?.details?.message}`);
                  } else {
                    toast.success('Widget sent!');
                  }
                },
                onError: () => {
                  toast.error('Something went wrong!');
                },
              },
            );
          }}
        />
      </ItemInfo>

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
      {/* TODO position */}
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

'use client';
import { useCurrentUser } from '@/hooks/use-current-user';
import PageWrapper from '@/components/shared/PageWrapper';
import { useParams, useRouter } from 'next/navigation';
import CategoryForm from '../_components/CategoryForm';
import { toast } from 'sonner';
import { trpc } from '@/trpc';

const AdminTicketsEditCategoryPanel = () => {
  const { categoryId } = useParams();
  const { user } = useCurrentUser();
  const router = useRouter();

  const {
    data: category,
    isLoading,
    refetch,
  } = trpc.admin.fetchTicketCategory.useQuery(
    { id: typeof categoryId === 'object' ? categoryId[0] : categoryId },
    {
      refetchOnWindowFocus: false,
      enabled: !!categoryId && !!user?.id,
    },
  );

  if (isLoading || !user?.selectedGuildId) {
    return 'Loading';
  }

  if (!category || !category.data) {
    toast.error('This category does not exist!');
    router.push('/dashboard/admin/tickets');
    return;
  }

  const data = category.data;

  return (
    <PageWrapper pageName="Admin" title={`Ticket - Editing (${data.name}) category`} showGoBack>
      <p className="text-muted-foreground mb-2">Remember to save your changes at the bottom of the page.</p>
      <CategoryForm
        refetch={refetch}
        id={data.id}
        mode="EDIT"
        guildId={user.selectedGuildId}
        values={{
          description: data.description,
          name: data.name,
          limit: data.limit,
          mapSelection: data.mapSelection,
          autoClose: data.autoClose,
          mentionSupport: data.mentionSupport,
          coordinateInput: data.coordinateInput,
          steamRequired: data.steamRequired,
          image: data.image ?? undefined,
          supportRoles: data.supportRoles,
          parentChannelId: data.parentChannelId ?? undefined,
          afterCreateDescription: data.afterCreateDescription ?? undefined,
          bannedRoleId: data.bannedRoleId ?? undefined,
          closeCommand: data.closeCommand ?? undefined,
          createConfirmation: data.createConfirmation ?? undefined,
          format: data.format,
        }}
      />
    </PageWrapper>
  );
};

export default AdminTicketsEditCategoryPanel;

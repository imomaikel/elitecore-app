'use client';
import { useCurrentUser } from '@/hooks/use-current-user';
import CategoryForm from '../_components/CategoryForm';
import AdminPageWrapper from '@/admin/PageWrapper';

const AdminTicketsNewCategoryPage = () => {
  const { user } = useCurrentUser();

  return (
    <AdminPageWrapper title="Create a new ticket category" showGoBack>
      <p className="text-muted-foreground my-2">Required fields are marked with *</p>
      {user?.selectedGuildId && <CategoryForm guildId={user.selectedGuildId} mode="CREATE" />}
    </AdminPageWrapper>
  );
};

export default AdminTicketsNewCategoryPage;

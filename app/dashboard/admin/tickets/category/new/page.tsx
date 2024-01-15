'use client';
import PageWrapper from '@/components/shared/PageWrapper';
import { useCurrentUser } from '@/hooks/use-current-user';
import CategoryForm from '../_components/CategoryForm';

const AdminTicketsNewCategoryPage = () => {
  const { user } = useCurrentUser();

  return (
    <PageWrapper pageName="Admin" title="Create a new ticket category" showGoBack>
      <p className="text-muted-foreground my-2">Required fields are marked with *</p>
      {user?.selectedGuildId && <CategoryForm guildId={user.selectedGuildId} mode="CREATE" />}
    </PageWrapper>
  );
};

export default AdminTicketsNewCategoryPage;

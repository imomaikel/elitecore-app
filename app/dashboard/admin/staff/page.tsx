'use client';
import PageWrapper from '@/components/shared/PageWrapper';
import StaffManager from './_components/StaffManager';
import StaffList from './_components/StaffList';
import ItemWrapper from '@/admin/ItemWrapper';
import { trpc } from '@/trpc';

const AdminStaffPage = () => {
  const { data: members, refetch } = trpc.getStaffMembers.useQuery(undefined, { refetchOnWindowFocus: false });

  return (
    <PageWrapper pageName="Admin" title="Staff">
      <ItemWrapper title="Current Staff">
        <StaffList members={members ?? []} refetch={refetch} />
      </ItemWrapper>
      <ItemWrapper title="Add a new member">
        <StaffManager refetch={refetch} />
      </ItemWrapper>
    </PageWrapper>
  );
};

export default AdminStaffPage;

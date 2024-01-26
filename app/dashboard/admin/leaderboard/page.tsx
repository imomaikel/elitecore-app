'use client';
import ActionButton from '@/components/shared/ActionButton';
import PageWrapper from '@/components/shared/PageWrapper';
import { useCurrentUser } from '@/hooks/use-current-user';
import { errorToast } from '@/shared/lib/utils';
import ItemWrapper from '@/admin/ItemWrapper';
import { redirect } from 'next/navigation';
import { toast } from 'sonner';
import { trpc } from '@/trpc';

const AdminLeaderboardPage = () => {
  const { user } = useCurrentUser();

  if (user && !user.selectedGuildId) redirect('/dashboard/admin/discord-selection');

  const { mutate: setupLeaderboard, isLoading } = trpc.admin.setupLeaderboard.useMutation();

  const onClick = () => {
    toast.info('Please wait...');
    setupLeaderboard(undefined, {
      onSuccess: ({ created, sent }) => {
        console.log(created, sent);
        if (created && sent) {
          toast.success('Created!');
        } else if (created) {
          errorToast('Created but failed to send!');
        } else {
          errorToast('Failed to create leaderboard!');
        }
      },
      onError: () => errorToast(),
    });
  };

  return (
    <PageWrapper pageName="Admin" title="Leaderboard">
      <ItemWrapper
        title="Create leaderboard"
        description="This will create a category channel and channels for each statistic (kills, deaths, ...)"
        className="max-w-md"
      >
        <ActionButton disabled={isLoading} onClick={onClick}>
          Create Leaderboard
        </ActionButton>
      </ItemWrapper>
    </PageWrapper>
  );
};

export default AdminLeaderboardPage;

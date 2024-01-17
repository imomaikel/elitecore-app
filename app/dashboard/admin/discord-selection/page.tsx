'use client';
import PageWrapper from '@/components/shared/PageWrapper';
import { useCurrentUser } from '@/hooks/use-current-user';
import GuildPicker from '../_components/GuildPicker';
import { errorToast } from '@/shared/lib/utils';
import Loader from '@/components/shared/Loader';
import ItemWrapper from '@/admin/ItemWrapper';
import { toast } from 'sonner';
import { trpc } from '@/trpc';

const AdminDiscordSelectionPage = () => {
  const { user, sessionStatus, update } = useCurrentUser();

  const { mutate: selectDiscordServer, isLoading: isUpdating } = trpc.admin.selectDiscordServer.useMutation({
    onSuccess: ({ error, guildName, success }) => {
      if (success) {
        toast.success(`Selected server "${guildName}"`);
      } else if (error) {
        errorToast();
      }
      update();
    },
    onError: ({ data }) => {
      errorToast(data);
      update();
    },
  });

  const onSelect = (guildId: string) => {
    if (user?.selectedGuildId === guildId || !guildId) return;
    selectDiscordServer({ guildId });
  };

  const isLoading = isUpdating || sessionStatus === 'loading';

  return (
    <PageWrapper pageName="Admin" title="Discord Selection">
      <ItemWrapper title="Select a Discord Server that you want to control">
        {isLoading ? (
          <Loader />
        ) : (
          <GuildPicker onSelect={onSelect} selectedValue={user?.selectedGuildId ?? undefined} />
        )}
      </ItemWrapper>
    </PageWrapper>
  );
};

export default AdminDiscordSelectionPage;

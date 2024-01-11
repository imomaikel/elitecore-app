'use client';
import { useCurrentUser } from '@/hooks/use-current-user';
import GuildPicker from '../_components/GuildPicker';
import { errorToast } from '@/shared/lib/utils';
import Loader from '@/components/shared/Loader';
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
    <>
      <h1 className="mb-4 text-2xl font-bold">Admin - Discord Selection</h1>
      <div className="flex flex-col">
        <h3 className="font-semibold mb-2">Select a Discord Server that you want to control</h3>
        {isLoading ? (
          <Loader />
        ) : (
          <GuildPicker onSelect={onSelect} selectedValue={user?.selectedGuildId ?? undefined} />
        )}
      </div>
    </>
  );
};

export default AdminDiscordSelectionPage;

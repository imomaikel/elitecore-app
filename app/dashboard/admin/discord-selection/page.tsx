'use client';
import GuildPicker from '../_components/GuildPicker';
import Loader from '@/components/shared/Loader';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { trpc } from '@/trpc';

const AdminDiscordSelectionPage = () => {
  const { data: session, status, update } = useSession();

  const { mutate: selectDiscordServer, isLoading: isUpdating } = trpc.admin.selectDiscordServer.useMutation({
    onSuccess: (guildName) => {
      if (guildName === false) {
        toast.error('Something went wrong');
        update();
        return;
      }
      toast.success(`Selected server "${guildName}"`);
      update();
    },
    onError: () => {
      toast.error('Something went wrong');
      update();
    },
  });

  const onSelect = (guildId: string) => {
    if (session?.user.selectedGuildId === guildId || !guildId) return;
    selectDiscordServer({ guildId });
  };

  const isLoading = isUpdating || status !== 'authenticated';

  return (
    <>
      <h1 className="mb-4 text-2xl font-bold">Admin - Discord Selection</h1>
      <div className="flex flex-col">
        <h3 className="font-semibold mb-2">Select a Discord Server that you want to control</h3>
        {isLoading ? (
          <Loader />
        ) : (
          <GuildPicker onSelect={onSelect} selectedValue={session?.user.selectedGuildId ?? undefined} />
        )}
      </div>
    </>
  );
};

export default AdminDiscordSelectionPage;

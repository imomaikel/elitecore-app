'use client';
import SelectBox from '@/components/shared/SelectBox';
import Loader from '@/components/shared/Loader';
import { toast } from 'sonner';
import { trpc } from '@/trpc';
import { useState } from 'react';
import { useSession } from 'next-auth/react';

const AdminDiscordSelectionPage = () => {
  const { data: session, status } = useSession();
  const [preSelectedValue, setPreSelectedValue] = useState<string | undefined>();
  const {
    data,
    isLoading: isApiLoading,
    isError,
  } = trpc.admin.apiDiscordSelection.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
  const { mutate: selectDiscordServer, isLoading: isUpdating } = trpc.admin.selectDiscordServer.useMutation();

  const onSelect = (guildId: string) => {
    selectDiscordServer(
      { guildId },
      {
        onSuccess: (response) => {
          if (response === false) return toast.error('Something went wrong!');
          const guildName = data?.find((server) => server.guildId === response)?.guildName;
          if (guildName) {
            toast.success(`Selected server "${guildName}"`);
            setPreSelectedValue(guildId);
            return;
          }
        },
        onError: () => {
          toast.error('Something went wrong.');
          setPreSelectedValue(undefined);
        },
      },
    );
  };

  const isLoading = isApiLoading || isUpdating || status !== 'authenticated';
  if (status === 'authenticated' && session.user.selectedGuildId && !preSelectedValue) {
    setPreSelectedValue(session.user.selectedGuildId);
  }

  return (
    <>
      <h1 className="mb-4 text-2xl font-bold">Admin - Discord Selection</h1>
      <div className="flex flex-col">
        <h3 className="font-semibold mb-2">Select a Discord Server that you want to control</h3>
        {!isLoading && !data && !isError && <p>No servers</p>}
        {isError && <p>Something went wrong.</p>}
        {isLoading && <Loader />}
        {!isLoading && data && (
          <SelectBox
            buttonText="Select server"
            noResultLabel="No servers found"
            onSelect={onSelect}
            options={data.map((entry) => ({
              label: entry.guildName,
              value: entry.guildId,
            }))}
            searchLabel="Search for a server"
            preSelectedValue={preSelectedValue}
          />
        )}
      </div>
    </>
  );
};

export default AdminDiscordSelectionPage;

'use client';
import { useCurrentUser } from '@/hooks/use-current-user';
import ChannelPicker from '../_components/ChannelPicker';
import Loader from '@/components/shared/Loader';
import { redirect } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { trpc } from '@/trpc';

const AdminServerStatusPage = () => {
  const { user, sessionStatus } = useCurrentUser();
  const [newWidgetChannelId, setNewWidgetChannelId] = useState('');

  if (user && !user.selectedGuildId) redirect('/dashboard/admin/discord-selection');

  const { mutate: updateWidgetChannel, isLoading: isWidgetUpdating } = trpc.admin.updateWidget.useMutation();
  const { mutate: updateNotifyChannel, isLoading: isNotifyUpdating } = trpc.admin.updateWidget.useMutation();
  const {
    data,
    isLoading: isApiLoading,
    isError,
    refetch,
  } = trpc.admin.getGuildDbChannels.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const isLoading = !(user && sessionStatus === 'authenticated' && !isApiLoading);

  if (!isLoading && newWidgetChannelId.length <= 1 && data && data.serverStatusChannelId) {
    setNewWidgetChannelId(data.serverStatusChannelId);
  }

  if (isError) {
    return (
      <>
        <h1 className="mb-4 text-2xl font-bold">Admin - Server Status</h1>
        <div>Something went wrong</div>
      </>
    );
  }
  return (
    <>
      <h1 className="mb-4 text-2xl font-bold">Admin - Server Status</h1>
      <div className="flex flex-col">
        <h3 className="font-semibold mb-2">Select a channel where the widget should be sent</h3>
        <div className="flex space-x-4">
          {isLoading || isWidgetUpdating ? (
            <Loader />
          ) : (
            <ChannelPicker
              type="TEXT"
              guildId={user.selectedGuildId as string}
              onSelect={(channelId) => {
                if (!channelId) return;
                updateWidgetChannel(
                  { channelId: channelId, widgetName: 'serverStatusWidget' },
                  {
                    onSuccess: (response) => {
                      if (response?.status === 'success') {
                        toast.success('Widget sent!');
                      } else {
                        toast.error(`Something went wrong! ${response?.details?.message}`);
                      }
                      refetch();
                    },
                    onError: () => {
                      toast.error('Something went wrong!');
                      refetch();
                    },
                  },
                );
              }}
              selectedValue={data && data.serverStatusChannelId ? data.serverStatusChannelId : undefined}
            />
          )}
        </div>

        <h3 className="font-semibold mb-2">Select a channel where server notifications will be sent</h3>
        {isLoading || isNotifyUpdating ? (
          <Loader />
        ) : (
          <ChannelPicker
            type="TEXT"
            guildId={user.selectedGuildId as string}
            onSelect={(channelId) => {
              if (!channelId) return;
              updateNotifyChannel(
                { channelId: channelId, widgetName: 'serverStatusNotify' },
                {
                  onSuccess: (response) => {
                    if (response?.status === 'success') {
                      toast.success('Channel updated!');
                    } else {
                      toast.error(`Something went wrong! ${response?.details?.message}`);
                    }
                    refetch();
                  },
                  onError: () => {
                    toast.error('Something went wrong!');
                    refetch();
                  },
                },
              );
            }}
            selectedValue={data && data.serverStatusNotifyChannelId ? data.serverStatusNotifyChannelId : undefined}
          />
        )}
      </div>
    </>
  );
};

export default AdminServerStatusPage;

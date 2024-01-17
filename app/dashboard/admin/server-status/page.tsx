'use client';
import PageWrapper from '@/components/shared/PageWrapper';
import { useCurrentUser } from '@/hooks/use-current-user';
import ChannelPicker from '../_components/ChannelPicker';
import Loader from '@/components/shared/Loader';
import ItemWrapper from '@/admin/ItemWrapper';
import { redirect } from 'next/navigation';
import { toast } from 'sonner';
import { trpc } from '@/trpc';

const AdminServerStatusPage = () => {
  const { user, sessionStatus } = useCurrentUser();

  if (user && !user.selectedGuildId) redirect('/dashboard/admin/discord-selection');

  const { mutate: updateWidgetChannel, isLoading: isWidgetUpdating } = trpc.admin.updateBroadcastWidget.useMutation();
  const { mutate: updateNotifyChannel, isLoading: isNotifyUpdating } = trpc.admin.updateBroadcastWidget.useMutation();

  const {
    data: channelIds,
    isLoading: isApiLoading,
    refetch,
  } = trpc.admin.getGuildDbSettings.useQuery(undefined, { refetchOnWindowFocus: false });

  const isLoading = !(user && sessionStatus === 'authenticated' && !isApiLoading);

  return (
    <PageWrapper pageName="Admin" title="Server Status">
      <ItemWrapper title="Select a channel where the widget should be sent">
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
            selectedValue={
              channelIds && channelIds.serverStatusChannelId ? channelIds.serverStatusChannelId : undefined
            }
          />
        )}
      </ItemWrapper>

      <ItemWrapper title="Select a channel where server notifications will be sent">
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
            selectedValue={
              channelIds && channelIds.serverStatusNotifyChannelId ? channelIds.serverStatusNotifyChannelId : undefined
            }
          />
        )}
      </ItemWrapper>
    </PageWrapper>
  );
};

export default AdminServerStatusPage;

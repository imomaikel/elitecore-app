'use client';
import { useCurrentUser } from '@/hooks/use-current-user';
import PageWrapper from '@/components/shared/PageWrapper';
import ChannelPicker from '@/admin/ChannelPicker';
import { errorToast } from '@/shared/lib/utils';
import Loader from '@/components/shared/Loader';
import ItemWrapper from '@/admin/ItemWrapper';
import RolePicker from '@/admin/RolePicker';
import { toast } from 'sonner';
import { trpc } from '@/trpc';

const AdminServerControlPage = () => {
  const { user, sessionStatus } = useCurrentUser();

  const {
    data,
    isLoading: isFetching,
    refetch,
  } = trpc.admin.getGuildDbSettings.useQuery(undefined, { refetchOnWindowFocus: false });

  const { mutate: updateBroadcastWidget, isLoading: isWidgetUpdating } = trpc.admin.updateBroadcastWidget.useMutation();
  const { mutate: updateRoleWidget, isLoading: isRoleUpdating } = trpc.admin.updateRoleWidget.useMutation();

  const isLoading = !(user && sessionStatus === 'authenticated' && !isFetching) || isWidgetUpdating || isRoleUpdating;

  return (
    <PageWrapper pageName="Admin" title="Server Control">
      <ItemWrapper title="Select a channel where the widget should be sent">
        {isLoading ? (
          <Loader />
        ) : (
          <ChannelPicker
            type="TEXT"
            guildId={user.selectedGuildId as string}
            onSelect={(channelId) => {
              updateBroadcastWidget(
                {
                  channelId,
                  widgetName: 'serverControlWidget',
                },
                {
                  onSuccess: (response) => {
                    if (response.status === 'error') {
                      errorToast(response.details?.message);
                    } else {
                      toast.success('Updated channel!');
                      refetch();
                    }
                  },
                  onError: () => errorToast(),
                },
              );
            }}
            selectedValue={data && data.serverControlChannelId ? data.serverControlChannelId : undefined}
          />
        )}
      </ItemWrapper>

      <ItemWrapper title="Select a role that can use the widget">
        {isLoading ? (
          <Loader />
        ) : (
          <RolePicker
            guildId={user.selectedGuildId as string}
            onSelect={(roleId) => {
              updateRoleWidget(
                {
                  roleId,
                  widgetName: 'serverControlRole',
                },
                {
                  onSuccess: (success) => {
                    if (success) {
                      toast.success('Updated role!');
                      refetch();
                    } else {
                      errorToast();
                    }
                  },
                  onError: () => errorToast(),
                },
              );
            }}
            selectedValue={data && data.serverControlRoleId ? data.serverControlRoleId : undefined}
          />
        )}
      </ItemWrapper>

      <ItemWrapper
        className="max-w-md"
        title="Select a channel where the logs will be sent"
        description="The logs are shared all across the Discord servers"
      >
        {isLoading ? (
          <Loader />
        ) : (
          <ChannelPicker
            type="TEXT"
            guildId={user.selectedGuildId as string}
            selectedValue={data && data.serverControlLogChannelId ? data.serverControlLogChannelId : undefined}
            onSelect={(channelId) => {
              updateBroadcastWidget(
                {
                  channelId,
                  widgetName: 'serverControlLog',
                },
                {
                  onSuccess: (response) => {
                    if (response.status === 'error') {
                      errorToast(response.details?.message);
                    } else {
                      toast.success('Updated channel!');
                      refetch();
                    }
                  },
                  onError: () => errorToast(),
                },
              );
            }}
          />
        )}
      </ItemWrapper>
    </PageWrapper>
  );
};

export default AdminServerControlPage;

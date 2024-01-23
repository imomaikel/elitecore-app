'use client';
import PageWrapper from '@/components/shared/PageWrapper';
import { useCurrentUser } from '@/hooks/use-current-user';
import ChannelPicker from '@/admin/ChannelPicker';
import DatePicker from './_components/DatePicker';
import { errorToast } from '@/shared/lib/utils';
import Loader from '@/components/shared/Loader';
import ItemWrapper from '@/admin/ItemWrapper';
import Restart from './_components/Restart';
import Format from './_components/Format';
import { toast } from 'sonner';
import { trpc } from '@/trpc';

const AdminCountdownPage = () => {
  const { user, sessionStatus } = useCurrentUser();

  const {
    data,
    isLoading: isFetching,
    refetch,
  } = trpc.admin.getCountdownData.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const { mutate: updateWidget } = trpc.admin.updateWidget.useMutation();

  const isLoading = !(user && sessionStatus === 'authenticated') || isFetching;

  return (
    <PageWrapper pageName="Admin" title="Countdown" className="mb-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        <DatePicker
          lastDate={data?.countdownLastDate?.toISOString() ?? ''}
          nextDate={data?.countdownNextDate?.toISOString() ?? ''}
        />

        <Restart rawMinutes={data?.countdownRestartInMinutes ?? 0} />
        <ItemWrapper title="Select a channel where the widget should be sent">
          {isLoading ? (
            <Loader />
          ) : (
            <ChannelPicker
              type="TEXT"
              guildId={user.selectedGuildId as string}
              selectedValue={data && data.countdownChannelId ? data.countdownChannelId : undefined}
              onSelect={(channelId) => {
                updateWidget(
                  {
                    channelId,
                    widgetName: 'countdownWidget',
                  },
                  {
                    onSuccess: (response) => {
                      if (response?.status === 'success') {
                        toast.success('Updated channel!');
                        refetch();
                      } else {
                        errorToast(response?.details?.message);
                      }
                    },
                    onError: () => errorToast(),
                  },
                );
              }}
            />
          )}
        </ItemWrapper>
        <Format header={data?.countdownHeader ?? ''} description={data?.countdownDescription ?? ''} />
      </div>
    </PageWrapper>
  );
};

export default AdminCountdownPage;

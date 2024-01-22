'use client';
import PageWrapper from '@/components/shared/PageWrapper';
import { useCurrentUser } from '@/hooks/use-current-user';
import ChannelPicker from '@/admin/ChannelPicker';
import Loader from '@/components/shared/Loader';
import ItemWrapper from '@/admin/ItemWrapper';
import DatePicker from './_components/Date';
import Restart from './_components/Restart';
import Format from './_components/Format';
import { trpc } from '@/trpc';

const AdminCountdownPage = () => {
  const { user, sessionStatus } = useCurrentUser();

  const { data, isLoading: isFetching } = trpc.admin.getCountdownData.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  // TODO
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { mutate: updateWidget, isLoading: isUpdating } = trpc.admin.updateWidget.useMutation();

  const isLoading = !(user && sessionStatus === 'authenticated') || isFetching;

  return (
    <PageWrapper pageName="Admin" title="Countdown" className="mb-16">
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
                  widgetName: 'ticketWidget',
                },
                // TODO
              );
            }}
          />
        )}
      </ItemWrapper>

      <DatePicker
        lastDate={data?.countdownLastDate?.toString() ?? ''}
        nextDate={data?.countdownNextDate?.toString() ?? ''}
      />

      <Restart rawMinutes={data?.countdownRestartInMinutes ?? 0} />
      <Format header={data?.countdownHeader ?? ''} description={data?.countdownDescription ?? ''} />
    </PageWrapper>
  );
};

export default AdminCountdownPage;

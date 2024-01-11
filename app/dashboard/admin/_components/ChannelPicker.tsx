import SelectBox from '@/components/shared/SelectBox';
import Loader from '@/components/shared/Loader';
import { trpc } from '@/trpc';

type TChannelPicker = {
  onSelect: (value: string) => void;
  guildId: string;
  className?: string;
  selectedValue?: string;
  isLoading?: boolean;
  type: 'TEXT' | 'CATEGORY';
  showCancel?: boolean;
};
const ChannelPicker = ({
  onSelect,
  className,
  guildId,
  selectedValue,
  type,
  isLoading: isDisabled,
  showCancel,
}: TChannelPicker) => {
  const { data: channels, isLoading: isFetching } = trpc.admin.getAllChannels.useQuery(
    { guildId, type },
    { refetchOnWindowFocus: true },
  );

  const isLoading = isDisabled || isFetching;

  return (
    <div className={className}>
      {isLoading ? (
        <Loader />
      ) : channels?.length ? (
        <SelectBox
          showCancel={showCancel}
          buttonText={`Select ${type === 'CATEGORY' ? 'category' : 'channel'}`}
          noResultLabel={`No ${type === 'CATEGORY' ? 'categories' : 'channels'} found`}
          onSelect={onSelect}
          options={channels.map(({ channelId, channelName }) => ({
            label: channelName,
            value: channelId,
          }))}
          searchLabel={`Search for a ${type === 'CATEGORY' ? 'category' : 'channel'}`}
          preSelectedValue={selectedValue ?? undefined}
        />
      ) : (
        <p>No channels found</p>
      )}
    </div>
  );
};

export default ChannelPicker;

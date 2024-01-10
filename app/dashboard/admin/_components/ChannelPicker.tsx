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
  const {
    data,
    isLoading: isFetching,
    isError,
  } = trpc.admin.getAllChannels.useQuery(
    { guildId, type },
    {
      refetchOnWindowFocus: true,
    },
  );

  const isLoading = isDisabled || isFetching;

  return (
    <div className={className}>
      {!isLoading && !data && !isError && <p>No channels</p>}
      {isError && <p>Something went wrong.</p>}
      {isLoading && <Loader />}
      {!isLoading && data && (
        <SelectBox
          showCancel={showCancel}
          buttonText={`Select ${type === 'CATEGORY' ? 'category' : 'channel'}`}
          noResultLabel={`No ${type === 'CATEGORY' ? 'categories' : 'channels'} found`}
          onSelect={onSelect}
          options={data.map((entry) => ({
            label: entry.channelName,
            value: entry.channelId,
          }))}
          searchLabel={`Search for a ${type === 'CATEGORY' ? 'category' : 'channel'}`}
          preSelectedValue={selectedValue ?? undefined}
        />
      )}
    </div>
  );
};

export default ChannelPicker;

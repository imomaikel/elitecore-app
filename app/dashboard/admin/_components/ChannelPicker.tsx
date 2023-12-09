import SelectBox from '@/components/shared/SelectBox';
import Loader from '@/components/shared/Loader';
import { trpc } from '@/trpc';

type TChannelPicker = {
  onSelect: (response: string) => void;
  guildId: string;
  className?: string;
  selectedValue?: string;
};
const ChannelPicker = ({ onSelect, className, guildId, selectedValue }: TChannelPicker) => {
  const { data, isLoading, isError } = trpc.admin.getAllChannels.useQuery(
    { guildId },
    {
      refetchOnWindowFocus: true,
    },
  );

  return (
    <div className={className}>
      {!isLoading && !data && !isError && <p>No channels</p>}
      {isError && <p>Something went wrong.</p>}
      {isLoading && <Loader />}
      {!isLoading && data && (
        <SelectBox
          buttonText="Select channel"
          noResultLabel="No channels found"
          onSelect={onSelect}
          options={data.map((entry) => ({
            label: entry.channelName,
            value: entry.channelId,
          }))}
          searchLabel="Search for a channel"
          preSelectedValue={selectedValue ?? undefined}
        />
      )}
    </div>
  );
};

export default ChannelPicker;

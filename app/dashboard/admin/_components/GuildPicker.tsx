import SelectBox from '@/components/shared/SelectBox';
import Loader from '@/components/shared/Loader';
import { trpc } from '@/trpc';

type TGuildPicker = {
  onSelect: (response: string) => void;
  className?: string;
  selectedValue?: string;
};
const GuildPicker = ({ onSelect, className, selectedValue }: TGuildPicker) => {
  const { data, isLoading, isError } = trpc.admin.getDiscordGuilds.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  return (
    <div className={className}>
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
          preSelectedValue={selectedValue}
        />
      )}
    </div>
  );
};

export default GuildPicker;

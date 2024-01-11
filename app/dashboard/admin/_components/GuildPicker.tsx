import SelectBox from '@/components/shared/SelectBox';
import Loader from '@/components/shared/Loader';
import { trpc } from '@/trpc';

type TGuildPicker = {
  onSelect: (value: string) => void;
  className?: string;
  selectedValue?: string;
};
const GuildPicker = ({ onSelect, className, selectedValue }: TGuildPicker) => {
  const { data: guilds, isLoading } = trpc.admin.getDiscordGuilds.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  return (
    <div className={className}>
      {isLoading ? (
        <Loader />
      ) : guilds?.length ? (
        <SelectBox
          buttonText="Select server"
          noResultLabel="No servers found"
          onSelect={onSelect}
          options={guilds.map(({ guildId, guildName }) => ({
            label: guildName,
            value: guildId,
          }))}
          searchLabel="Search for a server"
          preSelectedValue={selectedValue}
        />
      ) : (
        <p>No servers found</p>
      )}
    </div>
  );
};

export default GuildPicker;

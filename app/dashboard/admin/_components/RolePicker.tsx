import SelectBox from '@/components/shared/SelectBox';
import Loader from '@/components/shared/Loader';
import { trpc } from '@/trpc';

type TRolePicker = {
  onSelect: (response: string) => void;
  guildId: string;
  className?: string;
  selectedValue?: string;
};
const RolePicker = ({ onSelect, className, guildId, selectedValue }: TRolePicker) => {
  const { data, isLoading, isError } = trpc.admin.getAllRoles.useQuery(
    { guildId },
    {
      refetchOnWindowFocus: true,
    },
  );

  return (
    <div className={className}>
      {!isLoading && !data && !isError && <p>No roles</p>}
      {isError && <p>Something went wrong.</p>}
      {isLoading && <Loader />}
      {!isLoading && data && (
        <SelectBox
          buttonText="Select role"
          noResultLabel="No roles found"
          onSelect={onSelect}
          options={data.map((entry) => ({
            label: entry.roleName,
            value: entry.roleId,
          }))}
          searchLabel="Search for a server"
          preSelectedValue={selectedValue}
        />
      )}
    </div>
  );
};

export default RolePicker;

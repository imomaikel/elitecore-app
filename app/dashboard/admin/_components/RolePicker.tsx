import SelectBox from '@/components/shared/SelectBox';
import Loader from '@/components/shared/Loader';
import { trpc } from '@/trpc';

type TRolePicker = {
  onSelect: (value: string, label: string) => void;
  guildId: string;
  className?: string;
  selectedValue?: string;
  isLoading?: boolean;
  noSelect?: boolean;
  exclude?: string[];
  showCancel?: boolean;
};
const RolePicker = ({
  onSelect,
  className,
  guildId,
  selectedValue,
  isLoading: isDisabled,
  noSelect,
  exclude,
  showCancel,
}: TRolePicker) => {
  const {
    data,
    isLoading: isFetching,
    isError,
  } = trpc.admin.getAllRoles.useQuery(
    { guildId },
    {
      refetchOnWindowFocus: true,
    },
  );

  const isLoading = isFetching || isDisabled;

  return (
    <div className={className}>
      {!isLoading && !data && !isError && <p>No roles</p>}
      {isError && <p>Something went wrong.</p>}
      {isLoading && <Loader />}
      {!isLoading && data && (
        <SelectBox
          showCancel={showCancel}
          noSelect={noSelect}
          buttonText="Select role"
          noResultLabel="No roles found"
          onSelect={onSelect}
          options={data
            .map((entry) => ({
              label: entry.roleName,
              value: entry.roleId,
            }))
            .filter((entry) => (exclude ? !exclude.includes(entry.value) : true))}
          searchLabel="Search for a role"
          preSelectedValue={selectedValue}
        />
      )}
    </div>
  );
};

export default RolePicker;

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
  const { data: roles, isLoading: isFetching } = trpc.admin.getAllRoles.useQuery(
    { guildId },
    { refetchOnWindowFocus: true },
  );

  const isLoading = isFetching || isDisabled;

  return (
    <div className={className}>
      {isLoading ? (
        <Loader />
      ) : roles?.length ? (
        <SelectBox
          showCancel={showCancel}
          noSelect={noSelect}
          buttonText="Select role"
          noResultLabel="No roles found"
          onSelect={onSelect}
          options={roles
            .map(({ roleId, roleName }) => ({
              label: roleName,
              value: roleId,
            }))
            .filter(({ value }) => (exclude ? !exclude.includes(value) : true))}
          searchLabel="Search for a role"
          preSelectedValue={selectedValue}
        />
      ) : (
        <p>No roles found</p>
      )}
    </div>
  );
};

export default RolePicker;

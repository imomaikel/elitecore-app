'use client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Button } from '@/shared/components/ui/button';
import { errorToast } from '@/shared/lib/utils';
import { FaMinus } from 'react-icons/fa';
import { Staff } from '@prisma/client';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { trpc } from '@/trpc';

type TStaffList = {
  members: Staff[];
  refetch: () => void;
};
const StaffList = ({ members, refetch }: TStaffList) => {
  const { mutate: removeStaffMember, isLoading } = trpc.admin.removeStaffMember.useMutation();
  const onRemove = (id: string) => {
    removeStaffMember(
      { id },
      {
        onSuccess: ({ error, memberName, success }) => {
          if (error) {
            errorToast();
          } else if (success) {
            toast.success(`Removed staff member "${memberName}"`);
            refetch();
          }
        },
        onError: () => errorToast(),
      },
    );
  };

  return (
    <div>
      <Table className="max-w-lg">
        <TableHeader>
          <TableRow>
            <TableHead>Member</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Joined At</TableHead>
            <TableHead>Remove</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id}>
              <TableCell>
                <div className="flex items-center font-semibold space-x-2">
                  <Avatar>
                    <AvatarImage alt="avatar" src={member.avatarUrl} />
                    <AvatarFallback>?</AvatarFallback>
                  </Avatar>
                  <span>{member.username}</span>
                </div>
              </TableCell>
              <TableCell>{member.role}</TableCell>
              <TableCell>{format(member.joinedAt, 'LL/dd/y')}</TableCell>
              <TableCell>
                <Button variant="destructive" size="icon" disabled={isLoading} onClick={() => onRemove(member.id)}>
                  <FaMinus className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default StaffList;

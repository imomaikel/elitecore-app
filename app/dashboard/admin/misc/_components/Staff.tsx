import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import Loader from '@/components/shared/Loader';
import ItemWrapper from '@/admin/ItemWrapper';
import Image from 'next/image';
import { trpc } from '@/trpc';

const Staff = () => {
  const { data: users, isLoading: usersLoading } = trpc.admin.getAuthorizedUsers.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  return (
    <ItemWrapper title="Authorized users">
      {usersLoading ? (
        <Loader />
      ) : (
        <Table className="max-w-md">
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="flex items-center">
                  <Avatar>
                    <AvatarImage src={user.avatar ?? ''} />
                    <AvatarFallback className="w-8 h-8 relative">
                      <Image src="https://cdn.discordapp.com/embed/avatars/3.png" alt="avatar" fill sizes="" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-2 font-semibold truncate">{user.name}</div>
                </TableCell>
                <TableCell>{user.role}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </ItemWrapper>
  );
};

export default Staff;

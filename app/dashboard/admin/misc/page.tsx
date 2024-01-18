'use client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import ActionDialog from '@/components/shared/ActionDialog';
import PageWrapper from '@/components/shared/PageWrapper';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import UpdateForm from './_components/UpdateForm';
import { CgPentagonRight } from 'react-icons/cg';
import Loader from '@/components/shared/Loader';
import { errorToast } from '@/shared/lib/utils';
import ItemWrapper from '@/admin/ItemWrapper';
import { schemaList } from '@/constans';
import { format } from 'date-fns';
import { useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { trpc } from '@/trpc';

const AdminMiscPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [monthlyPaymentGoal, setMonthlyPaymentGoal] = useState<null | number>(null);

  const { data: users, isLoading: usersLoading } = trpc.admin.getAuthorizedUsers.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
  const { data: config, isLoading: configLoading } = trpc.admin.getConfig.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
  const { mutate: setMonthlyGoal, isLoading: isUpdating } = trpc.admin.setMonthlyGoal.useMutation();

  const { mutate: wipeSchema, isLoading: isDeleting } = trpc.admin.wipeSchema.useMutation();
  const onDatabaseReset = () => {
    wipeSchema(undefined, {
      onSuccess: ({ error, success }) => {
        if (error) {
          errorToast();
        } else if (success) {
          toast.success('Schemas deleted!');
        }
      },
      onError: () => errorToast(),
    });
  };

  if (config && !monthlyPaymentGoal) {
    setMonthlyPaymentGoal(config.monthlyPaymentGoal);
  }

  return (
    <>
      <PageWrapper pageName="Admin" title="Miscellaneous" className="space-y-3">
        <ItemWrapper title="Last wipe checker">
          {usersLoading ? (
            <Loader />
          ) : (
            <>
              <Label htmlFor="wipe">The last wipe was detected on</Label>
              <Input
                disabled
                id="wipe"
                value={format(config?.lastWipe ?? new Date(), 'dd/MM/yy')}
                className="max-w-[225px] mt-1"
              />
            </>
          )}
        </ItemWrapper>

        <ItemWrapper title="Monthly goal">
          <Label htmlFor="cost">Current goal</Label>
          <div className="flex space-x-2 mt-1">
            {configLoading ? (
              <Loader />
            ) : (
              <>
                <Input
                  id="cost"
                  type="number"
                  min={1}
                  placeholder="Enter monthly goal..."
                  className="max-w-[225px]"
                  value={monthlyPaymentGoal ?? 0}
                  onChange={(e) => setMonthlyPaymentGoal(parseInt(e.target.value))}
                  disabled={isUpdating}
                />
                <Button
                  disabled={isUpdating}
                  onClick={() => {
                    if (typeof monthlyPaymentGoal === 'number') {
                      setMonthlyGoal(
                        {
                          monthlyPaymentGoal,
                        },
                        {
                          onSuccess: ({ error, success }) => {
                            if (error) {
                              errorToast();
                            } else if (success) {
                              toast.success('Updated monthly goal!');
                            }
                          },
                          onError: () => errorToast(),
                        },
                      );
                    }
                  }}
                >
                  Update
                </Button>
              </>
            )}
          </div>
        </ItemWrapper>

        <ItemWrapper
          title="Widget update time"
          description="This is the delay in minutes that each widget is updated"
          className="max-w-md"
        >
          {configLoading ? (
            <Loader />
          ) : (
            <UpdateForm
              serverControlUpdateDelay={config?.serverControlUpdateDelay}
              serverStatusUpdateDelay={config?.serverStatusUpdateDelay}
            />
          )}
        </ItemWrapper>

        <ItemWrapper
          title="Reset database"
          description={
            <ul>
              {schemaList.map((schema) => (
                <li className="flex" key={schema}>
                  <CgPentagonRight className="h-6 w-6" /> {schema}
                </li>
              ))}
            </ul>
          }
        >
          <p className="text-muted-foreground">Click to expand the list of schemas that will be deleted</p>

          <Button
            variant="destructive"
            className="mt-2 w-32"
            onClick={() => setIsDialogOpen(true)}
            disabled={isDeleting}
          >
            RESET
          </Button>
        </ItemWrapper>

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
      </PageWrapper>
      <ActionDialog
        description="This action will delete all of the schemas listed."
        isOpen={isDialogOpen}
        onOpenChange={() => setIsDialogOpen(!isDialogOpen)}
        onProceed={onDatabaseReset}
        title="Are you sure?"
        proceedLabel="DELETE"
      />
    </>
  );
};

export default AdminMiscPage;

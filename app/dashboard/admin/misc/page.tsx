'use client';
import ActionDialog from '@/components/shared/ActionDialog';
import PageWrapper from '@/components/shared/PageWrapper';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import UpdateForm from './_components/UpdateForm';
import { CgPentagonRight } from 'react-icons/cg';
import { errorToast } from '@/shared/lib/utils';
import Loader from '@/components/shared/Loader';
import ItemWrapper from '@/admin/ItemWrapper';
import { schemaList } from '@/constans';
import Staff from './_components/Staff';
import Goal from './_components/Goal';
import { format } from 'date-fns';
import { useState } from 'react';
import { toast } from 'sonner';
import { trpc } from '@/trpc';

const AdminMiscPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: config, isLoading: configLoading } = trpc.admin.getConfig.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

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

  return (
    <>
      <PageWrapper pageName="Admin" title="Miscellaneous" className="space-y-3">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
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
                countdownUpdateDelay={config?.countdownUpdateDelay}
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

          <ItemWrapper title="Last wipe checker">
            {configLoading ? (
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

          {configLoading ? <Goal.Skeleton /> : <Goal goal={config?.monthlyPaymentGoal ?? 0} />}

          <Staff />
        </div>
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

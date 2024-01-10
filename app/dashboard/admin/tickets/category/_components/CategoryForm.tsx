'use client';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form';
import {
  TTicketCategoryCreateSchema,
  TTicketCategoryEditSchema,
  TicketCategoryCreateSchema,
  TicketCategoryEditSchema,
} from '../../_assets/validators';
import { Separator } from '@/shared/components/ui/separator';
import { Textarea } from '@/shared/components/ui/textarea';
import { Switch } from '@/shared/components/ui/switch';
import { Button } from '@/shared/components/ui/button';
import { zodResolver } from '@hookform/resolvers/zod';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import ChannelPicker from '@/admin/ChannelPicker';
import RolePicker from '@/admin/RolePicker';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { trpc } from '@/trpc';

type TCategoryCreate = {
  mode: 'CREATE';
  guildId: string;
};
type TCategoryEdit = {
  mode: 'EDIT';
  guildId: string;
  values: TTicketCategoryEditSchema;
  id: string;
  refetch: () => void;
};
type TCategoryForm = TCategoryCreate | TCategoryEdit;

const CategoryForm = (props: TCategoryForm) => {
  const { guildId, mode } = props;
  const router = useRouter();

  type TForm = typeof mode extends 'EDIT' ? TTicketCategoryEditSchema : TTicketCategoryCreateSchema;

  const form = useForm<TForm>({
    resolver: zodResolver(mode === 'EDIT' ? TicketCategoryEditSchema : TicketCategoryCreateSchema),
    defaultValues: {
      autoClose: mode === 'EDIT' ? props.values.autoClose : 15,
      afterCreateDescription: mode === 'EDIT' ? props.values.afterCreateDescription : '',
      image: mode === 'EDIT' ? props.values.image : '',
      closeCommand: mode === 'EDIT' ? props.values.closeCommand : '',
      name: mode === 'EDIT' ? props.values.name : '',
      limit: mode === 'EDIT' ? props.values.limit : 1,
      createConfirmation: mode === 'EDIT' ? props.values.createConfirmation : '',
      bannedRoleId: mode === 'EDIT' ? props.values.bannedRoleId : '',
      description: mode === 'EDIT' ? props.values.description : '',
      parentChannelId: mode === 'EDIT' ? props.values.parentChannelId : '',
      coordinateInput: mode === 'EDIT' ? props.values.coordinateInput : false,
      steamRequired: mode === 'EDIT' ? props.values.steamRequired : false,
      mapSelection: mode === 'EDIT' ? props.values.mapSelection : false,
      mentionSupport: mode === 'EDIT' ? props.values.mentionSupport : false,
      supportRoles: mode === 'EDIT' ? props.values.supportRoles : [],
    },
  });

  const { mutate: createTicketCategory, isLoading: isCreating } = trpc.admin.createTicketCategory.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(`Created new category "${form.getValues('name')}"`);
        router.push('/dashboard/admin/tickets');
      } else {
        toast.error('Something went wrong!');
      }
    },
    onError: () => toast.error('Something went wrong!'),
  });
  const { mutate: editTicketCategory, isLoading: isUpdating } = trpc.admin.editTicketCategory.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(`Updated category "${form.getValues('name')}"`);
        if (mode === 'EDIT') props.refetch();
      } else {
        toast.error('Something went wrong!');
      }
    },
    onError: () => toast.error('Something went wrong!'),
  });

  const onSubmit = (values: TForm) => {
    if (mode === 'CREATE') {
      createTicketCategory(values);
    } else if (mode === 'EDIT') {
      editTicketCategory({ values, id: props.id });
    }
  };

  const isLoading = isUpdating || isCreating;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mb-12">
        {/* Input text */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ticket category name*</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isLoading} placeholder="Enter a name for the new category" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category image</FormLabel>
                <FormControl>
                  <Input disabled={isLoading} type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="closeCommand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Close command</FormLabel>
                <FormControl>
                  <Input disabled={isLoading} {...field} placeholder="$close" />
                </FormControl>
                <FormDescription>The command that is used to close the ticket (with prefix)</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator className="!my-6" />

        {/* Input number */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="autoClose"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Auto close</FormLabel>
                <FormControl>
                  <Input disabled={isLoading} type="number" {...field} placeholder="10" />
                </FormControl>
                <FormDescription>
                  The delay in minutes to close a ticket when no message is sent. Type 0 to disable.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="limit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ticket limit</FormLabel>
                <FormControl>
                  <Input disabled={isLoading} type="number" {...field} placeholder="1" />
                </FormControl>
                <FormDescription>Limit opened tickets per user</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator className="!my-6" />

        {/* Input pick */}
        <FormField
          control={form.control}
          name="supportRoles"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Support role(s)</FormLabel>
              {field.value && field.value?.length >= 1 && (
                <div>
                  <FormDescription>Click on the role to remove access</FormDescription>
                  <div className="my-1 flex flex-wrap gap-2">
                    {field.value?.map(({ roleId, roleName }) => (
                      <Badge
                        key={`support-${roleName}`}
                        className="cursor-pointer"
                        onClick={() =>
                          form.setValue(
                            'supportRoles',
                            form.getValues('supportRoles')?.filter((entry) => entry.roleId !== roleId),
                          )
                        }
                      >
                        {roleName}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <FormControl>
                <RolePicker
                  noSelect
                  isLoading={isLoading}
                  guildId={guildId}
                  exclude={form.getValues('supportRoles')?.map(({ roleId }) => roleId)}
                  onSelect={(value, label) => {
                    if (!value) return;
                    const currentValues = form.getValues('supportRoles');
                    const isAlready = currentValues?.find(({ roleId }) => roleId === value);
                    if (isAlready) return;

                    form.setValue('supportRoles', [...(currentValues ?? []), { roleId: value, roleName: label }]);
                  }}
                />
              </FormControl>
              <FormDescription>Select role(s) that can have access to the ticket</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator className="!my-4" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="parentChannelId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category channel</FormLabel>
                <FormControl>
                  <ChannelPicker
                    showCancel
                    isLoading={isLoading}
                    type="CATEGORY"
                    selectedValue={field.value ?? undefined}
                    guildId={guildId}
                    onSelect={(channelId) => {
                      if (!channelId) return;
                      form.setValue('parentChannelId', channelId);
                    }}
                  />
                </FormControl>
                <FormDescription>New ticket channels will be appended to selected category channel.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bannedRoleId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Banned role</FormLabel>
                <FormControl>
                  <RolePicker
                    showCancel
                    isLoading={isLoading}
                    guildId={guildId}
                    selectedValue={field.value ?? undefined}
                    onSelect={(roleId) => {
                      if (!roleId) return;
                      form.setValue('bannedRoleId', roleId);
                    }}
                  />
                </FormControl>
                <FormDescription>Select a role that can not create tickets</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator className="!my-6" />

        {/* Input switch */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <FormField
            control={form.control}
            name="steamRequired"
            render={({ field }) => (
              <FormItem className="flex space-x-2">
                <FormLabel className="mt-2.5">Require Steam (ASE & ASA)</FormLabel>
                <FormControl>
                  <Switch
                    disabled={isLoading}
                    defaultChecked={field.value}
                    onCheckedChange={(e) => form.setValue('steamRequired', e)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="coordinateInput"
            render={({ field }) => (
              <FormItem className="flex space-x-2">
                <FormLabel className="mt-2.5">Require coordinates</FormLabel>
                <FormControl>
                  <Switch
                    disabled={isLoading}
                    defaultChecked={field.value}
                    onCheckedChange={(e) => form.setValue('coordinateInput', e)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="mapSelection"
            render={({ field }) => (
              <FormItem className="flex space-x-2">
                <FormLabel className="mt-2.5">Require map selection</FormLabel>
                <FormControl>
                  <Switch
                    disabled={isLoading}
                    defaultChecked={field.value}
                    onCheckedChange={(e) => form.setValue('mapSelection', e)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="mentionSupport"
            render={({ field }) => (
              <FormItem className="flex space-x-2">
                <FormLabel className="mt-2.5">Mention @here after creation</FormLabel>
                <FormControl>
                  <Switch
                    disabled={isLoading}
                    defaultChecked={field.value}
                    onCheckedChange={(e) => form.setValue('mentionSupport', e)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator className="!my-6" />

        {/* Input textarea */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description*</FormLabel>
                <FormControl>
                  <Textarea
                    disabled={isLoading}
                    {...field}
                    placeholder="Enter a description for the new category"
                    rows={6}
                  />
                </FormControl>
                <FormDescription>
                  This is the short description visible in the list of ticket categories.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="afterCreateDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>After Description</FormLabel>
                <FormControl>
                  <Textarea
                    disabled={isLoading}
                    {...field}
                    placeholder="Enter a description for the new category"
                    rows={6}
                  />
                </FormControl>
                <FormDescription>
                  This is the message inside the ticket channel. It can contain the next steps for the ticket creator.
                  If empty, the description will be sent.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="createConfirmation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Create confirmation</FormLabel>
                <FormControl>
                  <Textarea disabled={isLoading} {...field} placeholder="Enter a message" rows={6} />
                </FormControl>
                <FormDescription>
                  This is the message that the user has to accept before creating a ticket. Example: Are you sure you
                  want to report an admin?
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator className="!my-6" />

        <div className="!mt-8">
          <Button disabled={isLoading} type="submit" className="w-full" size="lg">
            {mode === 'CREATE' ? 'Create' : 'Save'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CategoryForm;

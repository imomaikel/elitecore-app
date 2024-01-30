'use client';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/components/ui/form';
import { StaffMemberSchema, TStaffMemberSchema } from '../../tickets/_assets/validators';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Button } from '@/shared/components/ui/button';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { errorToast } from '@/shared/lib/utils';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { toast } from 'sonner';
import { trpc } from '@/trpc';

type TStaffManager = {
  refetch: () => void;
};
const StaffManager = ({ refetch }: TStaffManager) => {
  const [discordId, setDiscordId] = useState('');

  const form = useForm<TStaffMemberSchema>({
    resolver: zodResolver(StaffMemberSchema),
    defaultValues: {
      avatarUrl: '',
      joinedAt: new Date(),
      role: '',
      username: '',
    },
  });

  const { mutate: getAvatar, isLoading: avatarLoading } = trpc.admin.getAvatar.useMutation();
  const onAvatar = () => {
    getAvatar(
      {
        discordId,
      },
      {
        onSuccess: (data) => {
          if (!data) return errorToast();
          form.setValue('avatarUrl', data);
          toast.success('Avatar URL Updated!');
        },
        onError: () => errorToast(),
      },
    );
  };

  const { mutate: addStaffMember, isLoading } = trpc.admin.addStaffMember.useMutation();

  const onSubmit = (values: TStaffMemberSchema) => {
    addStaffMember(
      {
        ...values,
      },
      {
        onSuccess: ({ error, success, memberName }) => {
          if (error) {
            errorToast();
          } else if (success) {
            toast.success(`Added staff member "${memberName}"`);
            form.reset();
            refetch();
          }
        },
        onError: () => errorToast(),
      },
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-sm space-y-2">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Member name</FormLabel>
              <FormControl>
                <Input {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Member role</FormLabel>
              <FormControl>
                <Input {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="avatarUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Avatar URL</FormLabel>
              <FormControl>
                <Input {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div>
          <Label>Load Avatar URL from Discord ID</Label>
          <div className="flex space-x-2">
            <Input disabled={avatarLoading} value={discordId} onChange={(e) => setDiscordId(e.target.value)} />
            <Button
              onClick={(e) => {
                e.preventDefault();
                onAvatar();
              }}
              disabled={avatarLoading}
              role="button"
            >
              Get Avatar
            </Button>
          </div>
        </div>
        <div>
          <p>Avatar preview</p>
          <div>
            <Avatar>
              <AvatarImage alt="avatar" src={form.getValues('avatarUrl')} />
              <AvatarFallback>?</AvatarFallback>
            </Avatar>
          </div>
        </div>

        <FormField
          control={form.control}
          name="joinedAt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Joined date</FormLabel>
              <FormControl>
                <Input
                  disabled={isLoading}
                  name={field.name}
                  type="date"
                  onChange={(e) => form.setValue(field.name, new Date(e.target.value))}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading} className="w-full !mt-4">
          Add Member
        </Button>
      </form>
    </Form>
  );
};

export default StaffManager;

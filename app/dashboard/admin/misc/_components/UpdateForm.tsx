'use client';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/components/ui/form';
import { TUpdateDelaySchema, UpdateDelaySchema } from '../../tickets/_assets/validators';
import { Button } from '@/shared/components/ui/button';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/shared/components/ui/input';
import { errorToast } from '@/shared/lib/utils';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { trpc } from '@/trpc';

type TUpdateForm = {
  serverStatusUpdateDelay: number | undefined;
  serverControlUpdateDelay: number | undefined;
};
const UpdateForm = ({ serverControlUpdateDelay, serverStatusUpdateDelay }: TUpdateForm) => {
  const form = useForm<TUpdateDelaySchema>({
    resolver: zodResolver(UpdateDelaySchema),
    defaultValues: {
      serverControlUpdateDelay: serverControlUpdateDelay ?? 3,
      serverStatusUpdateDelay: serverStatusUpdateDelay ?? 3,
    },
  });

  const { mutate: updateDelays, isLoading } = trpc.admin.updateDelays.useMutation();

  const onSubmit = (values: TUpdateDelaySchema) => {
    updateDelays(values, {
      onSuccess: ({ error, success }) => {
        if (error) {
          errorToast();
        } else if (success) {
          toast.success('Updated delays!');
        }
      },
      onError: () => errorToast(),
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-sm space-y-2">
        <FormField
          control={form.control}
          name="serverControlUpdateDelay"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Server Control Delay</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => form.setValue(field.name, parseInt(e.target.value))}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="serverStatusUpdateDelay"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Server Status Delay</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => form.setValue(field.name, parseInt(e.target.value))}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          Update
        </Button>
      </form>
    </Form>
  );
};

export default UpdateForm;

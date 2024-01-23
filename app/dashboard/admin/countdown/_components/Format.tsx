'use client';
import ActionButton from '@/components/shared/ActionButton';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { errorToast } from '@/shared/lib/utils';
import ItemWrapper from '@/admin/ItemWrapper';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { trpc } from '@/trpc';

type TFormat = {
  header: string;
  description: string;
};
const Format = ({ description, header }: TFormat) => {
  const [widgetHeader, setWidgetHeader] = useState('');
  const [widgetDescription, setWidgetDescription] = useState('');

  useEffect(() => {
    setWidgetHeader(header);
    setWidgetDescription(description);
  }, [description, header]);

  const { mutate: setCountdownFormat, isLoading } = trpc.admin.setCountdownFormat.useMutation();

  const onUpdate = () => {
    setCountdownFormat(
      {
        description: widgetDescription,
        header: widgetHeader,
      },
      {
        onSuccess: ({ error, success }) => {
          if (success) {
            toast.success('Updated header and description!');
          } else if (error) {
            errorToast();
          }
        },
        onError: () => errorToast(),
      },
    );
  };

  return (
    <ItemWrapper
      title="Widget format"
      description={
        <pre>
          {`Formatting:
    Emojis allowed
    Use <old/TYPE> or <new/TYPE> to format the date
    Examples: <new/R> <new/F> <old/f>
  Format TYPES:
    t: Example: 09:01
    T: Example: 09:01:00
    d: Example:	28/11/2018
    D: Example:	28 November 2018
    f: Example:	28 November 2018 09:01
    F: Example: Wednesday, 28 November 2018 09:01
    R: Example: 3 years ago / in a day
    `}
        </pre>
      }
      className="max-w-md"
    >
      <Label htmlFor="header">Header</Label>
      <Input
        id="header"
        className="max-w-sm"
        value={widgetHeader}
        onChange={(e) => setWidgetHeader(e.target.value)}
        disabled={isLoading}
      />

      <Label htmlFor="description">Description</Label>
      <Textarea
        className="max-w-sm"
        value={widgetDescription}
        rows={5}
        onChange={(e) => setWidgetDescription(e.target.value)}
        disabled={isLoading}
      />

      <ActionButton className="max-w-sm w-full mt-4" onClick={onUpdate} disabled={isLoading}>
        Update
      </ActionButton>
    </ItemWrapper>
  );
};

export default Format;

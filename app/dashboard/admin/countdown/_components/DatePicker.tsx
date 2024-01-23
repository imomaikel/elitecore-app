'use client';
import ActionButton from '@/components/shared/ActionButton';
import { errorToast } from '@/shared/lib/utils';
import ItemWrapper from '@/admin/ItemWrapper';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { trpc } from '@/trpc';

type TDatePicker = {
  nextDate: string;
  lastDate: string;
};
const DatePicker = ({ lastDate, nextDate }: TDatePicker) => {
  const [widgetNextDate, setWidgetNextDate] = useState('');
  const [widgetLastDate, setWidgetLastDate] = useState('');

  useEffect(() => {
    setWidgetNextDate(nextDate);
    setWidgetLastDate(lastDate);
  }, [nextDate, lastDate]);

  const { mutate: setCountdownDate, isLoading } = trpc.admin.setCountdownDate.useMutation();

  const onUpdate = () => {
    setCountdownDate(
      { lastDate: new Date(widgetLastDate), nextDate: new Date(widgetNextDate) },
      {
        onSuccess: ({ error, success }) => {
          if (success) {
            toast.success('Updated countdown date!');
          } else if (error) {
            errorToast();
          }
        },
        onError: () => errorToast(),
      },
    );
  };

  return (
    <div>
      <ItemWrapper title="The last countdown date">
        <input
          type="datetime-local"
          value={widgetLastDate.slice(0, 16)}
          onChange={(e) => setWidgetLastDate(e.target.value)}
          disabled={isLoading}
        />
      </ItemWrapper>
      <ItemWrapper title="The next countdown date">
        <input
          type="datetime-local"
          value={widgetNextDate.slice(0, 16)}
          onChange={(e) => setWidgetNextDate(e.target.value)}
          disabled={isLoading}
        />
      </ItemWrapper>
      <ActionButton className="max-w-sm w-full mt-4" disabled={isLoading} onClick={onUpdate}>
        Update
      </ActionButton>
    </div>
  );
};

export default DatePicker;

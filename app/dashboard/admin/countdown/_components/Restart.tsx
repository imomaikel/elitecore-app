'use client';
import { errorToast, extractMinutes } from '@/shared/lib/utils';
import ActionButton from '@/components/shared/ActionButton';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import ItemWrapper from '@/admin/ItemWrapper';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { trpc } from '@/trpc';

type TRestart = {
  rawMinutes: number;
};
const Restart = ({ rawMinutes }: TRestart) => {
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);

  useEffect(() => {
    const extracted = extractMinutes(rawMinutes);
    setDays(extracted.days);
    setHours(extracted.hours);
    setMinutes(extracted.minutes);
  }, [rawMinutes]);

  const onChange = (value: number, mode: 'DAY' | 'HOUR' | 'MINUTE') => {
    if (mode === 'DAY') setDays(value);
    if (mode === 'HOUR') setHours(value);
    if (mode === 'MINUTE') setMinutes(value);
  };

  const { mutate: setCountdownRestart, isLoading } = trpc.admin.setCountdownRestart.useMutation();

  const onUpdate = () => {
    const getMinutes = minutes + hours * 60 + days * 24 * 60;
    setCountdownRestart(
      { minutes: getMinutes },
      {
        onSuccess: ({ error, success }) => {
          if (success) {
            toast.success('Auto-restart updated!');
          } else if (error) {
            errorToast();
          }
        },
        onError: () => errorToast(),
      },
    );
  };

  return (
    <ItemWrapper title="Auto restart">
      <Label htmlFor="days">Days</Label>
      <Input
        id="days"
        className="max-w-sm"
        value={days}
        onChange={(e) => onChange(parseInt(e.target.value), 'DAY')}
        type="number"
        disabled={isLoading}
      />
      <Label htmlFor="hours">Hours</Label>
      <Input
        id="hours"
        className="max-w-sm"
        value={hours}
        onChange={(e) => onChange(parseInt(e.target.value), 'HOUR')}
        type="number"
        disabled={isLoading}
      />
      <Label htmlFor="minutes">Minutes</Label>
      <Input
        id="minutes"
        className="max-w-sm"
        value={minutes}
        onChange={(e) => onChange(parseInt(e.target.value), 'MINUTE')}
        type="number"
        disabled={isLoading}
      />
      <ActionButton className="max-w-sm w-full mt-4" onClick={onUpdate} disabled={isLoading}>
        Update
      </ActionButton>
    </ItemWrapper>
  );
};

export default Restart;

import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { errorToast } from '@/shared/lib/utils';
import Loader from '@/components/shared/Loader';
import ItemWrapper from '@/admin/ItemWrapper';
import { useState } from 'react';
import { toast } from 'sonner';
import { trpc } from '@/trpc';

type TGoal = {
  goal: number;
};
const Goal = ({ goal }: TGoal) => {
  const [monthlyPaymentGoal, setMonthlyPaymentGoal] = useState<number>(goal);

  const { mutate: setMonthlyGoal, isLoading: isUpdating } = trpc.admin.setMonthlyGoal.useMutation();

  return (
    <ItemWrapper title="Monthly goal">
      <Label htmlFor="cost">Current goal</Label>
      <div className="flex space-x-2 mt-1">
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
      </div>
    </ItemWrapper>
  );
};
Goal.Skeleton = function ShowSkeleton() {
  return (
    <ItemWrapper title="Monthly goal">
      <Label htmlFor="cost">Current goal</Label>
      <div className="flex space-x-2 mt-1">
        <Loader />
      </div>
    </ItemWrapper>
  );
};

export default Goal;

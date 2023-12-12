'use client';
import { Progress } from '@/shared/components/ui/progress';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { trpc } from '@/trpc';

const PaymentGoal = () => {
  const { data: progress, isLoading } = trpc.getMonthlyCosts.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  if (!isLoading && progress === undefined) return null;

  return (
    <div>
      <h1 className="font-semibold text-xl md:text-2xl text-primary">Monthly Costs</h1>
      <div className="relative">
        {isLoading ? <Skeleton className="h-2 w-full" /> : <Progress value={progress} />}
        <div className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 absolute w-full -top-3 h-12 blur-[150px] opacity-75" />
      </div>
      {isLoading ? <Skeleton className="h-5 w-[110px] mt-1" /> : <p className="">{progress}% completed</p>}
    </div>
  );
};

export default PaymentGoal;

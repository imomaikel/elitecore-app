'use client';
import UserMention from './UserMention';
import { trpc } from '@/trpc';

const TopDonators = () => {
  const { data, isLoading } = trpc.getTopDonators.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  if (!isLoading && !data) return null;
  if (!isLoading && data.overall.length <= 0 && data.overall.length <= 0) return null;

  return (
    <div>
      <h1 className="font-semibold text-xl md:text-2xl text-primary">Top Donators</h1>
      <div className="flex flex-col gap-y-2">
        {isLoading ? (
          <>
            <UserMention.BigSkeleton />
            <UserMention.BigSkeleton />
          </>
        ) : (
          <>
            {data.overall.length >= 1 ? (
              <UserMention
                avatarUrl={data.overall[0].avatarUrl ?? '/logo.png'}
                username={data.overall[0].username!}
                text="Paid the most overall"
              />
            ) : null}
            {data.thisMonth.length >= 1 ? (
              <UserMention
                avatarUrl={data.thisMonth[0].avatarUrl ?? '/logo.png'}
                username={data.thisMonth[0].username!}
                text="Paid the most this month"
              />
            ) : null}
          </>
        )}
      </div>
    </div>
  );
};

export default TopDonators;

'use client';
import UserMention from './UserMention';
import { trpc } from '@/trpc';

const RecentPayments = () => {
  const { data, isLoading } = trpc.getRecentPayments.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  if (!isLoading && !data) return null;
  if (data && data?.length <= 0) return null;

  return (
    <div>
      <h3 className="font-semibold text-xl md:text-2xl text-primary">Recent Payments</h3>
      <div className="flex flex-col gap-y-2">
        {isLoading ? (
          <>
            <UserMention.SmallSkeleton />
            <UserMention.SmallSkeleton />
            <UserMention.SmallSkeleton />
            <UserMention.SmallSkeleton />
          </>
        ) : (
          data.map((user, index) => (
            <UserMention
              key={`${user.username}${index}`}
              avatarUrl={user.avatarUrl ?? '/logo.png'}
              username={user.username!}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default RecentPayments;

'use client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { Skeleton } from '@/shared/components/ui/skeleton';
import PageWrapper from '@/components/shared/PageWrapper';
import { Switch } from '@/shared/components/ui/switch';
import { Label } from '@/shared/components/ui/label';
import NoData from '@/components/shared/NoData';
import LogTable from './_components/LogTable';
import { LogType } from '@prisma/client';
import { toast } from 'sonner';
import { trpc } from '@/trpc';

const OPTIONS = Object.keys(LogType) as Array<keyof typeof LogType>;

const TribeLogsPage = () => {
  const { data, isLoading, refetch, isRefetching } = trpc.getTribeLogs.useQuery(undefined, {
    refetchOnWindowFocus: false,
    retry: 1,
  });

  if (isLoading) return <TribeLogsPage.Skeleton />;

  if (!data?.success) return <NoData />;

  return (
    <PageWrapper pageName="Tribe" title={data.tribeName}>
      <div>
        <LogTable
          logs={data.messages}
          refetch={() => refetch().then(() => toast.success('Logs updated!'))}
          isRefetching={isRefetching}
        />
      </div>
    </PageWrapper>
  );
};
TribeLogsPage.Skeleton = function ShowSkeleton() {
  return (
    <PageWrapper pageName="Tribe" title={<Skeleton className="w-[125px] h-8 ml-2" />}>
      <div className="flex flex-wrap gap-4">
        {OPTIONS.map((option) => (
          <div className="flex items-center space-x-1 relative" key={`option-${option}`}>
            <Label htmlFor={option} className="invisible">
              {option.replace(/_/gi, ' ')}
            </Label>
            <Switch id={option} className="invisible" aria-label="Switch filter" />
            <Skeleton className="h-full w-full absolute" />
          </div>
        ))}
      </div>
      <div className="my-4 flex space-x-4">
        <Skeleton className="w-32 h-8" />
        <Skeleton className="w-32 h-8" />
      </div>
      <div className="w-[90vw] mx-auto md:mx-0 overflow-x-auto md:w-full">
        <Table className="min-w-[600px] md:min-w-fit">
          <TableHeader>
            <TableRow>
              <TableHead>
                <Skeleton className="h-9" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-9" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array.from(Array(10).keys())].map((index) => (
              <TableRow key={`skeleton-${index}`}>
                <TableCell>
                  <Skeleton className="h-5" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Skeleton className="w-full md:w-[500px] h-8 ml-2" />
    </PageWrapper>
  );
};

export default TribeLogsPage;

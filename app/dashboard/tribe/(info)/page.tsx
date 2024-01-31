'use client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { HiStatusOnline, HiStatusOffline } from 'react-icons/hi';
import { Skeleton } from '@/shared/components/ui/skeleton';
import PageWrapper from '@/components/shared/PageWrapper';
import NoData from '@/components/shared/NoData';
import { ImSpinner9 } from 'react-icons/im';
import Chart from './_components/Chart';
import { trpc } from '@/trpc';

const TribeLogsPage = () => {
  const { data, isLoading } = trpc.getTribe.useQuery();

  if (isLoading) return <TribeLogsPage.Skeleton />;

  if (!data?.success) {
    return <NoData />;
  }

  const { members, tribe, user: userInGame } = data.data;

  return (
    <PageWrapper pageName="Tribe" title={tribe.tribeName}>
      <div className="w-[90vw] mx-auto md:mx-0 overflow-x-auto md:w-full">
        <Table className="min-w-[600px] md:min-w-fit">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Play time</TableHead>
              <TableHead>Kills</TableHead>
              <TableHead>Deaths</TableHead>
              <TableHead>Wild Dinos Kills</TableHead>
              <TableHead>Tamed Dinos Kills</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[userInGame, ...members].map(
              ({ deaths, isOnline, kills, playTimeText, playerName, steamId, tamedDinosKills, wildDinosKills }) => (
                <TableRow key={steamId}>
                  <TableCell className="flex items-center space-x-2">
                    {isOnline ? (
                      <div className="text-emerald-500 animate-pulse">
                        <HiStatusOnline className="h-4 w-4" />
                      </div>
                    ) : (
                      <div className="text-destructive">
                        <HiStatusOffline className="h-4 w-4" />
                      </div>
                    )}
                    <span>{playerName.length >= 1 ? playerName : 'Unnamed'}</span>
                  </TableCell>
                  <TableCell>{playTimeText}</TableCell>
                  <TableCell>{kills}</TableCell>
                  <TableCell>{deaths}</TableCell>
                  <TableCell>{wildDinosKills}</TableCell>
                  <TableCell>{tamedDinosKills}</TableCell>
                </TableRow>
              ),
            )}
          </TableBody>
        </Table>
      </div>

      <Chart
        data={[userInGame, ...members].map(({ playerName, playTime, playTimeText }) => ({
          label: playerName.length >= 1 ? playerName : 'Unnamed',
          value: playTime ?? 0,
          customText: playTimeText,
        }))}
      />
    </PageWrapper>
  );
};
TribeLogsPage.Skeleton = function ShowSkeleton() {
  return (
    <PageWrapper pageName="Tribe" title={<Skeleton className="w-[125px] h-8 ml-2" />}>
      <div className="w-[90vw] mx-auto md:mx-0 overflow-x-auto md:w-full">
        <Table className="min-w-[600px] md:min-w-fit">
          <TableHeader>
            <TableRow>
              <TableHead>
                <Skeleton className="h-8 my-1" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-8 my-1" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-8 my-1" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-8 my-1" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-8 my-1" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-8 my-1" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array.from(Array(5).keys())].map((index) => (
              <TableRow key={`skeleton-${index}`}>
                <TableCell>
                  <Skeleton className="h-5" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5" />
                </TableCell>
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

      <div className="mt-12 w-full flex items-center justify-center flex-col">
        <Skeleton className="w-48 h-8" />
        <Skeleton className="w-[360px] mt-1 h-4" />
        <ImSpinner9 className="mt-16 h-40 w-40 animate-spin opacity-75" />
      </div>
    </PageWrapper>
  );
};

export default TribeLogsPage;

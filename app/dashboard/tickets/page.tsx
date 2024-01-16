'use client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { Skeleton } from '@/shared/components/ui/skeleton';
import PageWrapper from '@/components/shared/PageWrapper';
import TicketTable from '@/components/TicketTable';
import { trpc } from '@/trpc';

const TicketsPage = () => {
  const { data: tickets, isLoading } = trpc.getUserTickets.useQuery();

  return (
    <PageWrapper pageName="Tickets" title="Review">
      <div>
        {isLoading || !tickets ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{isLoading ? <Skeleton className="h-8" /> : 'Category'}</TableHead>
                <TableHead>{isLoading ? <Skeleton className="h-8" /> : 'Created at'}</TableHead>
                <TableHead>{isLoading ? <Skeleton className="h-8" /> : 'Closed at'}</TableHead>
                <TableHead>{isLoading ? <Skeleton className="h-8" /> : 'Actions'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array.from(Array(6).keys())].map((entry) => (
                  <TableRow key={`skeleton-${entry}`}>
                    <TableCell>
                      <Skeleton className="h-8" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8" />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No tickets
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        ) : (
          <TicketTable data={tickets} showAuthor={false} />
        )}
      </div>
    </PageWrapper>
  );
};

export default TicketsPage;

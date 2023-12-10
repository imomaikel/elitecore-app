'use client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { FaChevronDown } from 'react-icons/fa6';
import { useEffect, useState } from 'react';
import { useDebounce } from 'usehooks-ts';
import { cn } from '@/shared/lib/utils';
import { format } from 'date-fns';
import { trpc } from '@/trpc';

const AdminLogsPage = () => {
  const [contentFilter, setContentFilter] = useState('');
  const contentDebounce = useDebounce<string>(contentFilter, 500);
  const [authorFiler, setAuthorFilter] = useState('');
  const authorDebounce = useDebounce<string>(authorFiler, 500);
  const [logsPerPage, setLogsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [order, setOrder] = useState<'desc' | 'asc'>('desc');

  const { data, isLoading, refetch } = trpc.admin.getLogs.useQuery(
    {
      logsPerPage,
      authorFilter: authorDebounce,
      contentFilter: contentDebounce,
      currentPage,
      order,
    },
    {
      refetchOnWindowFocus: false,
    },
  );

  useEffect(() => {
    refetch();
  }, [contentDebounce, authorDebounce, logsPerPage, order]);

  const totalPages = (data?.guild?.logs && Math.round(data.totalLogsSize / logsPerPage)) ?? 0;

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Admin - Logs</h1>

      <div className="my-4">
        <div className="flex flex-col md:flex-row md:gap-x-2">
          <div className="flex flex-col">
            <span className="mb-2">Filter by author</span>
            <Input onChange={(e) => setAuthorFilter(e.target.value)} value={authorFiler} />
          </div>
          <div className="flex flex-col">
            <span className="mb-2">Filter by content</span>
            <Input onChange={(e) => setContentFilter(e.target.value)} value={contentFilter} className="mb-4" />
          </div>
        </div>
        <div className="flex space-x-4">
          <div>
            <div className="mb-2">Logs per page</div>
            <Select value={logsPerPage.toString()} onValueChange={(e) => setLogsPerPage(parseInt(e))}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-center flex-col">
            <span className="mb-2">
              Page: {currentPage}/{totalPages}
            </span>
            <div className="space-x-2">
              <Button
                size="sm"
                disabled={currentPage === 1 || isLoading}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Prev
              </Button>
              <Button
                size="sm"
                disabled={currentPage >= totalPages || isLoading}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Author</TableHead>
            <TableHead>Content</TableHead>
            <TableHead>
              Date
              <Button
                size="sm"
                onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')}
                variant="ghost"
                className="ml-2"
              >
                <FaChevronDown className={cn('h-2 w-2', order === 'asc' ? 'rotate-180' : 'rotate-0')} />
              </Button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading
            ? [...Array.from(Array(logsPerPage).keys())].map((log) => (
                <TableRow key={log}>
                  <TableCell>
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                </TableRow>
              ))
            : data?.guild?.logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.author.name}</TableCell>
                  <TableCell>{log.content}</TableCell>
                  <TableCell>{format(new Date(log.createdAt), 'dd/MM h:m')}</TableCell>
                </TableRow>
              ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AdminLogsPage;

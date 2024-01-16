import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { Button } from '@/shared/components/ui/button';
import { relativeDate } from '@/shared/lib/utils';
import { LuArrowDownUp } from 'react-icons/lu';
import { IoMdMore } from 'react-icons/io';
import { useState } from 'react';
import Link from 'next/link';

type TTicket = {
  id: string;
  createdAt: Date;
  closedAt: Date | null;
  categoryName: string;
  authorUsername: string;
};

const columns: ColumnDef<TTicket>[] = [
  {
    accessorKey: 'id',
    header: 'Id',
  },
  {
    accessorKey: 'authorUsername',
    header: 'Author',
  },
  {
    accessorKey: 'categoryName',
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Category
          <LuArrowDownUp className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Created at
          <LuArrowDownUp className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const strDate = relativeDate(row.getValue('createdAt'));
      return strDate;
    },
  },
  {
    accessorKey: 'closedAt',
    header: 'Closed at',
    cell: ({ row }) => {
      const value = row.getValue('closedAt');
      return value ?? '-';
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const original = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <IoMdMore className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link href={`/dashboard/tickets/${original.id}`}>Open ticket</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

type TTicketTable = {
  data: TTicket[];
  showAuthor: boolean;
};
const TicketTable = ({ data, showAuthor }: TTicketTable) => {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      columnVisibility: {
        id: false,
        authorUsername: showAuthor,
      },
      sorting,
    },
  });

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id}>
                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.length ? (
          table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={columns.length} className="h-24 text-center">
              No results
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default TicketTable;

import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { DataTablePagination } from '@/shared/components/data-table-pagination';
import { Switch } from '@/shared/components/ui/switch';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { relativeDate } from '@/shared/lib/utils';
import { LogType } from '@prisma/client';
import { useState } from 'react';

type TOptionArray = Array<keyof typeof LogType>;
const OPTIONS = Object.keys(LogType) as TOptionArray;
type TLog = { content: string; logType: LogType; timestamp: Date };

const columns: ColumnDef<TLog>[] = [
  {
    accessorKey: 'content',
    header: 'Content',
  },
  {
    accessorKey: 'timestamp',
    header: 'Date',
    cell: ({ row }) => {
      const getDate: Date = row.getValue('timestamp');
      const formatDate = relativeDate(getDate);

      return formatDate;
    },
  },
  {
    accessorKey: 'logType',
    header: 'Type',
    filterFn: (row, columnId, filterVal) => {
      const getType = row.getValue('logType');

      const canShow = filterVal.includes(getType);

      return canShow;
    },
  },
];

const LogTable = ({ logs }: { logs: TLog[] }) => {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([
    {
      id: 'logType',
      value: [],
    },
  ]);

  const table = useReactTable({
    data: logs,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      columnVisibility: {
        logType: false,
      },
      columnFilters,
    },
  });

  const onSwitch = (option: LogType) => {
    const filters = table.getColumn('logType')?.getFilterValue() as TOptionArray;
    if (filters.includes(option)) {
      table.getColumn('logType')?.setFilterValue(filters.filter((entry) => entry !== option));
    } else {
      table.getColumn('logType')?.setFilterValue([...filters, option]);
    }
  };

  const onSwitchAll = (method: 'on' | 'off') => {
    if (method === 'off') {
      table.getColumn('logType')?.setFilterValue([]);
    } else if (method === 'on') {
      table.getColumn('logType')?.setFilterValue([...OPTIONS]);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-4">
        {OPTIONS.map((option) => (
          <div className="flex items-center space-x-1" key={`option-${option}`}>
            <Label htmlFor={option}>{option.replace(/_/gi, ' ')}</Label>
            <Switch
              id={option}
              checked={(table.getColumn('logType')?.getFilterValue() as TOptionArray).includes(option)}
              onCheckedChange={() => onSwitch(option)}
            />
          </div>
        ))}
      </div>
      <div className="my-4 flex space-x-4">
        <Button size="sm" className="w-32" variant="secondary" onClick={() => onSwitchAll('on')}>
          All On
        </Button>
        <Button size="sm" className="w-32" variant="secondary" onClick={() => onSwitchAll('off')}>
          All Off
        </Button>
      </div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
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
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <DataTablePagination table={table} />
    </div>
  );
};

export default LogTable;

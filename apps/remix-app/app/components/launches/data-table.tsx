import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Button } from '~/components/ui/button';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';

export type TSortingState = {
  id: string;
  desc: boolean;
};

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  totalCount: number;
  isLoading: boolean;
  pageIndex: number;
  pageSize: number;
  onPageChange: (pageIndex: number) => void;
  onSortingChange: (sorting: TSortingState) => void;
  sorting: TSortingState;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  totalCount,
  isLoading = false,
  pageIndex,
  pageSize,
  onPageChange,
  onSortingChange,
  sorting,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    rowCount: totalCount,
    state: {
      pagination: {
        pageIndex,
        pageSize,
      },
      sorting: [{ id: sorting.id, desc: sorting.desc }],
    },
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        const newPageIndex = updater({
          pageIndex,
          pageSize,
        }).pageIndex;
        onPageChange(newPageIndex);
      }
    },
    onSortingChange: (updater) => {
      if (typeof updater === 'function') {
        const newSortingState = updater(table.getState().sorting);
        if (newSortingState && newSortingState.length > 0) {
          onSortingChange({
            id: newSortingState[0].id,
            desc: newSortingState[0].desc,
          });
        }
      }
    },
  });

  return (
    <div className='relative'>
      {isLoading && (
        <div className='absolute inset-0 z-10 bg-white/50 flex items-center justify-center'>
          <div className='animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full' />
        </div>
      )}
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className='h-[57px] min-h-[57px]'
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className='h-[57px] min-h-[57px]'>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className='flex items-center justify-between py-4'>
        <span className='text-sm text-muted-foreground'>
          Showing {pageIndex * pageSize + 1} to{' '}
          {Math.min((pageIndex + 1) * pageSize, totalCount)} of {totalCount}{' '}
          results
        </span>
        <div className='flex items-center space-x-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage() || isLoading}
          >
            Previous
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage() || isLoading}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

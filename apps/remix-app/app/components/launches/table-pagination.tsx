import { Table } from '@tanstack/react-table';
import { Button } from '~/components/ui/button';

type TablePaginationProps = {
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  table: Table<any>;
  isLoading: boolean;
};

export function TablePagination({
  pageIndex,
  pageSize,
  totalCount,
  table,
  isLoading,
}: TablePaginationProps) {
  return (
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
  );
}

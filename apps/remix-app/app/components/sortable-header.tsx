// components/table/sortable-header.tsx
import { Column } from '@tanstack/react-table';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '~/components/ui/button';

interface SortableHeaderProps<TData, TValue> {
  column: Column<TData, TValue>;
  title: string;
}

export function SortableHeader<TData, TValue>({
  column,
  title,
}: SortableHeaderProps<TData, TValue>) {
  const isSorted = column.getIsSorted();

  return (
    <Button
      variant='ghost'
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      className='-ml-4'
    >
      {title}
      {isSorted ? (
        isSorted === 'asc' ? (
          <ArrowUp className='ml-2 h-4 w-4' />
        ) : (
          <ArrowDown className='ml-2 h-4 w-4' />
        )
      ) : (
        <ArrowUpDown className='ml-2 h-4 w-4' />
      )}
    </Button>
  );
}

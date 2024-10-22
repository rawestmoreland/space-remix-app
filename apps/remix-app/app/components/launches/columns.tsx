'use client';

import { Link } from '@remix-run/react';
import { ColumnDef } from '@tanstack/react-table';
import { SortableHeader } from '~/components/sortable-header';
import { ILaunchResult } from '~/services/launchService';

export const columns: ColumnDef<ILaunchResult>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => <SortableHeader column={column} title='Name' />,
    cell: ({ row }) => {
      const name: string = row.getValue('name') ?? 'N/A';
      const id: string = row.original.id;
      return (
        <Link to={`/launch/${id}`} className='text-blue-500'>
          {name}
        </Link>
      );
    },
  },
  {
    accessorKey: 'agency',
    header: 'Agency',
    cell: ({ row }) => {
      const agencies = row.original.mission.agencies;

      const getAgencyName = (name: string) => {
        switch (name) {
          case 'National Aeronautics and Space Administration':
            return 'NASA';
          default:
            return name;
        }
      };

      return agencies.map((a) => getAgencyName(a.name)).join(', ');
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    accessorFn: (row) => row.status.abbrev,
  },
  {
    accessorKey: 'mission-description',
    header: 'Mission',
    cell: ({ row }) => {
      return (
        <div className='line-clamp-2 max-w-[300px]'>
          {row.original.mission.description}
        </div>
      );
    },
  },
  {
    accessorKey: 'net',
    header: ({ column }) => (
      <SortableHeader column={column} title='NET (No Earlier Than)' />
    ),
    accessorFn: (row) =>
      new Date(row.net).toLocaleDateString('en-US', {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit',
        hour: 'numeric',
        minute: 'numeric',
        timeZoneName: 'short',
      }),
  },
];

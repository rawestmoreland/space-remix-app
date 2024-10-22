import {
  ClientLoaderFunctionArgs,
  useLoaderData,
  json,
  useFetcher,
} from '@remix-run/react';
import { useState } from 'react';
import { columns, DataTable, TSortingState } from '~/components/launches';
import { StatusFilter } from '~/components/launches/status-filter';
import { TypographyH1 } from '~/components/ui/typography';
import {
  getLaunches,
  getLaunchStatuses,
  ILaunchResponse,
} from '~/services/launchService';

export async function loader({ request }: ClientLoaderFunctionArgs) {
  const { env } = process;
  const queryURL = new URL(`${env.LL_BASE_URL}/launches`);
  const url = new URL(request.url);

  const offset = url.searchParams.get('offset') || '0';
  const limit = url.searchParams.get('limit') || '10';
  const ordering = url.searchParams.get('ordering') || 'net';
  const statusId = url.searchParams.get('status') || '';

  // Only allow valid column names to be used for sorting
  const validSortColumns = ['net', '-net', 'name', '-name']; // Add more as needed
  const sanitizedOrdering = validSortColumns.includes(ordering)
    ? ordering
    : 'net';

  queryURL.searchParams.append('offset', offset);
  queryURL.searchParams.append('limit', limit);
  queryURL.searchParams.append('ordering', sanitizedOrdering);
  if (statusId && statusId !== 'all') {
    queryURL.searchParams.append('status', statusId);
  }

  const [launchesResponse, statusesResponse] = await Promise.all([
    getLaunches(queryURL.toString()),
    getLaunchStatuses(),
  ]);

  if (launchesResponse.error) {
    throw json({ error: launchesResponse.error }, { status: 500 });
  }
  return json({
    launches: launchesResponse.data as ILaunchResponse,
    statuses: statusesResponse.data,
  });
}

export default function Launches() {
  const { launches, statuses } = useLoaderData<typeof loader>();

  const pageLimit = 10;
  const [page, setPage] = useState(0);
  const [sorting, setSorting] = useState<TSortingState>({
    id: 'net',
    desc: false,
  });
  const [selectedStatus, setSelectedStatus] = useState('');
  const fetcher = useFetcher();

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchData(newPage, sorting, selectedStatus);
  };

  const handleSortingChange = (newSorting: TSortingState) => {
    setSorting(newSorting);
    setPage(0);
    fetchData(0, newSorting, selectedStatus);
  };

  const handleStatusChange = (newStatus: string) => {
    setSelectedStatus(newStatus);
    setPage(0);
    fetchData(0, sorting, newStatus);
  };

  const fetchData = (
    pageIndex: number,
    sortState: TSortingState,
    status: string
  ) => {
    const offset = pageIndex * pageLimit;
    const orderingParam = sortState.desc ? `-${sortState.id}` : sortState.id;

    let url = `?offset=${offset}&limit=${pageLimit}&ordering=${orderingParam}`;
    if (status && status !== 'all') {
      url += `&status=${status}`;
    }

    fetcher.load(url);
  };

  const currentData =
    (fetcher.data as { launches: typeof launches })?.launches || launches;

  return (
    <main className='flex-1'>
      <div className='mx-auto w-full max-w-6xl px-4 md:px-0 flex flex-col gap-4'>
        <div className='my-4'>
          <TypographyH1>Launches</TypographyH1>
        </div>
        <div className='w-full flex justify-end'>
          <div>
            <StatusFilter
              statuses={statuses.results}
              selectedStatus={selectedStatus}
              onStatusChange={handleStatusChange}
            />
          </div>
        </div>
        <DataTable
          columns={columns}
          data={currentData?.results ?? []}
          totalCount={currentData?.count ?? 0}
          pageSize={pageLimit}
          pageIndex={page}
          onPageChange={handlePageChange}
          onSortingChange={handleSortingChange}
          sorting={sorting}
          isLoading={fetcher.state === 'loading'}
        />
      </div>
    </main>
  );
}

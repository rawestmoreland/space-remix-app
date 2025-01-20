import {
  useLoaderData,
  json,
  ClientLoaderFunctionArgs,
  useFetcher,
} from '@remix-run/react';
import { Loader2Icon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { AstronautCard } from '~/components/astronaut-card';
import { AstronautDetail } from '~/components/astronaut-detail';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { TypographyH1, TypographyMuted } from '~/components/ui/typography';
import {
  getAstronauts,
  getAstronautStatuses,
  IAstronaut,
  IAstronautStatus,
} from '~/services/astronautService';

export async function loader({ request }: ClientLoaderFunctionArgs) {
  const { env } = process;

  const queryURL = new URL(`${env.LL_BASE_URL}/astronauts`);
  const statusesURL = new URL(`${env.LL_BASE_URL}/config/astronaut_statuses`);
  const url = new URL(request.url);

  const offset = url.searchParams.get('offset') || '0';
  const limit = url.searchParams.get('limit') || '40';
  const statusId = url.searchParams.get('status_ids') || '';
  const nationality = url.searchParams.get('nationality') || '';

  queryURL.searchParams.append('offset', offset);
  queryURL.searchParams.append('limit', limit);
  if (statusId) {
    queryURL.searchParams.append('status_ids', statusId);
  }
  if (nationality) {
    queryURL.searchParams.append('nationality', nationality);
  }
  queryURL.searchParams.append('ordering', '-time_in_space');
  const { data, error } = await getAstronauts(queryURL.toString());
  const { data: statuses, error: statusesError } = await getAstronautStatuses(
    statusesURL.toString()
  );
  if (error || statusesError) {
    throw json({ error: error || statusesError }, { status: 500 });
  }
  return json({ astronauts: data, statuses: statuses });
}

export default function Astronauts() {
  const { astronauts, statuses } = useLoaderData<typeof loader>();

  const [items, setItems] = useState<IAstronaut[]>(astronauts.results);
  const [limit, setLimit] = useState(40);
  const [offset, setOffset] = useState(astronauts.results.length);
  const [hasMore, setHasMore] = useState(astronauts.next !== null);
  const [statusId, setStatusId] = useState<string | null>(null);
  const [nationality, setNationality] = useState<string | null>(null);
  const fetcher = useFetcher<typeof loader>();
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (fetcher.data) {
      setItems((prevItems: IAstronaut[]) => {
        const newItems = fetcher.data?.astronauts?.results || [];
        const uniqueNewItems = newItems.filter(
          (newItem: IAstronaut) =>
            !prevItems.some(
              (prevItem: IAstronaut) => prevItem.id === newItem.id
            )
        );
        return [...prevItems, ...uniqueNewItems];
      });

      if (fetcher.data.astronauts.next === null) {
        setHasMore(false);
      } else {
        const url = new URL(fetcher.data.astronauts.next);
        const offset = url.searchParams.get('offset') || '0';
        const limit = url.searchParams.get('limit') || '40';
        setOffset(Number(offset));
        setLimit(Number(limit));
      }
    }
  }, [fetcher.data]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMore && fetcher.state === 'idle') {
          fetcher.load(
            `/astronauts?offset=${offset}&limit=${limit}${nationality === 'All' || !nationality ? '' : `&nationality=${nationality}`}${statusId === 'All' || !statusId ? '' : `&status_ids=${statusId}`}`
          );
        }
      },
      { threshold: 1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, offset, limit, fetcher, nationality, statusId]);

  useEffect(() => {
    if (fetcher.state === 'idle') {
      setItems([]); // Reset items when status changes
      setOffset(0); // Reset offset
      setLimit(40); // Reset limit
      setHasMore(true); // Reset hasMore flag
      fetcher.load(
        `/astronauts?offset=0&limit=40${nationality === 'All' || !nationality ? '' : `&nationality=${nationality}`}${statusId === 'All' || !statusId ? '' : `&status_ids=${statusId}`}`
      );
    }
  }, [statusId, nationality]);

  const handleClearFilters = () => {
    setStatusId(null);
    setNationality(null);
  };

  return (
    <main className='flex-1'>
      <div className='flex flex-col gap-2 mx-auto mb-8 w-full max-w-6xl px-4 md:px-0'>
        <div className='my-4'>
          <TypographyH1>Astronauts</TypographyH1>
          <TypographyMuted>
            Sorted by time in space, most time in space first.
          </TypographyMuted>
        </div>
        <div className='flex gap-4'>
          {statuses?.results && (
            <Select
              value={statusId || ''}
              onValueChange={(value) => setStatusId(value)}
            >
              <SelectTrigger className='w-40'>
                <SelectValue placeholder='Select Status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='All'>All</SelectItem>
                {statuses.results.map((status: IAstronautStatus) => (
                  <SelectItem key={status.id} value={status.id.toString()}>
                    {status.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Select
            value={nationality || ''}
            onValueChange={(value) => setNationality(value)}
          >
            <SelectTrigger className='w-40'>
              <SelectValue placeholder='Select Nationality' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='All'>All</SelectItem>
              {[
                'American',
                'Russian',
                'Chinese',
                'Japanese',
                'French',
                'Canadian',
                'German',
                'Italian',
                'Spanish',
                'Australian',
                'Brazilian',
              ].map((nationality: string) => (
                <SelectItem key={nationality} value={nationality}>
                  {nationality}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant='outline' onClick={handleClearFilters}>
            Clear
          </Button>
        </div>
        {items?.length > 0 ? (
          <>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
              {items.map((astronaut: IAstronaut) => (
                <Dialog key={astronaut.id}>
                  <DialogTrigger asChild>
                    <div className='cursor-pointer'>
                      <AstronautCard astronaut={astronaut} />
                    </div>
                  </DialogTrigger>
                  <DialogContent className='max-w-3xl'>
                    <DialogHeader>
                      <DialogTitle>Astronaut Details</DialogTitle>
                    </DialogHeader>
                    <AstronautDetail astronaut={astronaut} />
                  </DialogContent>
                </Dialog>
              ))}
            </div>
            {hasMore && (
              <div
                ref={loaderRef}
                className='mx-auto mt-4 flex w-full items-center justify-center text-center text-primary'
              >
                <Loader2Icon className='h-8 w-8 animate-spin' />
              </div>
            )}
          </>
        ) : fetcher.state === 'loading' ? (
          <div className='flex  justify-center mt-16 h-screen'>
            <Loader2Icon className='h-8 w-8 animate-spin' />
          </div>
        ) : (
          <div ref={loaderRef} className='text-center'>
            No astronauts found
          </div>
        )}
      </div>
    </main>
  );
}

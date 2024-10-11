import {
  useFetcher,
  useLoaderData,
  json,
  ClientLoaderFunctionArgs,
} from '@remix-run/react';
import { Loader2Icon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { LaunchCard } from '~/components/launch-card';
import { LaunchDetail } from '~/components/launch-detail';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import { TypographyH1 } from '~/components/ui/typography';
import { getLaunches, ILaunch } from '~/services/launchService';

export async function loader({ request }: ClientLoaderFunctionArgs) {
  const { env } = process;
  const queryURL = new URL(`${env.LL_BASE_URL}/launches/upcoming`);
  const url = new URL(request.url);

  const offset = url.searchParams.get('offset') || '0';
  const limit = url.searchParams.get('limit') || '40';

  queryURL.searchParams.append('offset', offset);
  queryURL.searchParams.append('limit', limit);
  queryURL.searchParams.append('search', 'spacex');
  queryURL.searchParams.append('ordering', '-net');

  const { data, error } = await getLaunches(queryURL.toString());
  if (error) {
    throw json({ error }, { status: 500 });
  }
  return json({ launches: data });
}

export default function UpcomingSpaceXLaunches() {
  const { launches } = useLoaderData<typeof loader>();

  const [items, setItems] = useState<ILaunch[]>(launches.results);
  const [limit, setLimit] = useState(40);
  const [offset, setOffset] = useState(launches.results.length);
  const [hasMore, setHasMore] = useState(launches.next !== null);

  const fetcher = useFetcher<typeof loader>();
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (fetcher.data) {
      setItems((prevItems: ILaunch[]) => {
        const newItems = fetcher.data?.launches.results || [];
        const uniqueNewItems = newItems.filter(
          (newItem: ILaunch) =>
            !prevItems.some((prevItem: ILaunch) => prevItem.id === newItem.id)
        );
        return [...prevItems, ...uniqueNewItems];
      });
      if (!fetcher.data.launches?.next === null) {
        setHasMore(false);
        return;
      }
      if (fetcher.data.launches.next === null) {
        setHasMore(false);
      } else {
        const url = new URL(fetcher.data.launches.next);
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
            `/launches/upcoming/spacex?offset=${offset}&limit=${limit}`
          );
        }
      },
      { threshold: 1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, offset, limit, fetcher]);

  return (
    <main className='flex-1'>
      <div className='mx-auto mb-8 w-full max-w-6xl px-4 md:px-0'>
        <div className='my-4'>
          <TypographyH1>Upcoming SpaceX Launches</TypographyH1>
        </div>
        {items.length > 0 ? (
          <>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
              {items.map((launch: ILaunch) => (
                <Dialog key={launch.id}>
                  <DialogTrigger asChild>
                    <div className='cursor-pointer'>
                      <LaunchCard launch={launch} />
                    </div>
                  </DialogTrigger>
                  <DialogContent className='max-w-3xl'>
                    <DialogHeader>
                      <DialogTitle>Launch Details</DialogTitle>
                    </DialogHeader>
                    <LaunchDetail launch={launch} />
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
        ) : (
          <div ref={loaderRef} className='text-center'>
            No upcoming launches
          </div>
        )}
      </div>
    </main>
  );
}

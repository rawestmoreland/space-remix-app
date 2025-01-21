import {
  useLoaderData,
  json,
  ClientLoaderFunctionArgs,
  useFetcher,
  Link,
} from '@remix-run/react';
import { Loader2Icon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { AstronautCard } from '~/components/astronauts/astronaut-card';
import { TypographyH1, TypographyMuted } from '~/components/ui/typography';
import {
  getAstronauts,
  getAstronautStatuses,
  IAstronautResult,
} from '~/services/astronautService';

export async function loader({ request }: ClientLoaderFunctionArgs) {
  const { env } = process;

  const queryURL = new URL(`${env.LL_BASE_URL}/astronauts`);
  const statusesURL = new URL(`${env.LL_BASE_URL}/config/astronaut_statuses`);
  const url = new URL(request.url);

  const offset = url.searchParams.get('offset') || '0';
  const limit = url.searchParams.get('limit') || '40';

  queryURL.searchParams.append('offset', offset);
  queryURL.searchParams.append('limit', limit);
  queryURL.searchParams.append('in_space', 'true'); // Add this parameter

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

export default function AstronautsInSpace() {
  const { astronauts } = useLoaderData<typeof loader>();

  const [items, setItems] = useState<IAstronautResult[]>(
    astronauts?.results || []
  );
  const [limit, setLimit] = useState(40);
  const [offset, setOffset] = useState(astronauts?.results.length || 0);
  const [hasMore, setHasMore] = useState(astronauts?.next !== null);
  const fetcher = useFetcher<typeof loader>();
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (fetcher.data) {
      setItems((prevItems: IAstronautResult[]) => {
        const newItems = fetcher.data?.astronauts?.results || [];
        const uniqueNewItems = newItems.filter(
          (newItem: IAstronautResult) =>
            !prevItems.some(
              (prevItem: IAstronautResult) => prevItem.id === newItem.id
            )
        );
        return [...prevItems, ...uniqueNewItems];
      });
      if (!fetcher.data.astronauts?.next === null) {
        setHasMore(false);
        return;
      }
      if (fetcher.data?.astronauts?.next === null) {
        setHasMore(false);
      } else {
        const url = new URL(fetcher.data?.astronauts?.next || '');
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
          fetcher.load(`/astronauts/in-space?offset=${offset}&limit=${limit}`);
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
      <div className='flex flex-col gap-2 mx-auto mb-8 w-full max-w-6xl px-4 md:px-0'>
        <div className='my-4'>
          <TypographyH1>Astronauts Currently in Space</TypographyH1>
          <TypographyMuted>
            Sorted by time in space, most time in space first.
          </TypographyMuted>
        </div>

        {items?.length > 0 ? (
          <>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
              {items.map((astronaut: IAstronautResult) => (
                <Link
                  to={`/astronaut/${astronaut.id}`}
                  key={astronaut.id}
                  prefetch='intent'
                >
                  <AstronautCard astronaut={astronaut} />
                </Link>
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
          <div className='flex justify-center mt-16 h-screen'>
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

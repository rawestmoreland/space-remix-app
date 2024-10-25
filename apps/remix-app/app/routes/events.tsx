import {
  ClientLoaderFunctionArgs,
  useFetcher,
  useLoaderData,
  json,
  Link,
} from '@remix-run/react';
import { Loader2Icon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { EventCard } from '~/components/events';
import { TypographyH1, TypographyMuted } from '~/components/ui/typography';
import {
  getEvents,
  IEventResponse,
  IEventResult,
} from '~/services/eventsService';
import { commitUrlSession, getUrlSession } from '~/sessions.server';

export async function loader({ request }: ClientLoaderFunctionArgs) {
  const session = await getUrlSession(request.headers.get('Cookie'));
  session.set('urlContext', request.url);

  const { env } = process;
  const queryURL = new URL(`${env.LL_BASE_URL}/events/upcoming`);
  const url = new URL(request.url);

  const offset = url.searchParams.get('offset') || '0';
  const limit = url.searchParams.get('limit') || '40';

  queryURL.searchParams.append('offset', offset);
  queryURL.searchParams.append('limit', limit);
  queryURL.searchParams.append('ordering', 'net');

  const { data, error } = await getEvents(queryURL.toString());
  if (error) {
    throw json({ error }, { status: 500 });
  }
  return json(
    { events: data as IEventResponse },
    {
      headers: { 'Set-Cookie': await commitUrlSession(session) },
    }
  );
}

export default function UpcomingEvents() {
  const { events } = useLoaderData<typeof loader>();

  const [items, setItems] = useState<IEventResult[]>(events.results);
  const [limit, setLimit] = useState(40);
  const [offset, setOffset] = useState(events.results.length);
  const [hasMore, setHasMore] = useState(events.next !== null);

  const fetcher = useFetcher<typeof loader>();
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (fetcher.data) {
      setItems((prevItems: IEventResult[]) => {
        const newItems = fetcher.data?.events.results || [];
        const uniqueNewItems = newItems.filter(
          (newItem: IEventResult) =>
            !prevItems.some(
              (prevItem: IEventResult) => prevItem.id === newItem.id
            )
        );
        return [...prevItems, ...uniqueNewItems];
      });
      if (!fetcher.data.events?.next === null) {
        setHasMore(false);
        return;
      }
      if (fetcher.data.events.next === null) {
        setHasMore(false);
      } else {
        const url = new URL(fetcher.data.events.next);
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
          fetcher.load(`/events/upcoming?offset=${offset}&limit=${limit}`);
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
          <TypographyH1>Upcoming Events</TypographyH1>
        </div>
        <div>
          <TypographyMuted>
            Stay up-to-date with the latest events happening in the space
            industry
          </TypographyMuted>
        </div>
        {items?.length > 0 ? (
          <>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8'>
              {items.map((event: IEventResult) => (
                <Link to={`/event/${event.id}`} key={`event-${event.id}`}>
                  <EventCard event={event} />
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
        ) : (
          <div ref={loaderRef} className='text-center'>
            No upcoming events
          </div>
        )}
      </div>
    </main>
  );
}

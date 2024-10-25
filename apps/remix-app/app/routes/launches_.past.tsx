import {
  useFetcher,
  useLoaderData,
  json,
  ClientLoaderFunctionArgs,
  Link,
} from '@remix-run/react';
import { ExternalLinkIcon, Loader2Icon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { LaunchCard, LaunchDetail } from '~/components/launches';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import { TypographyH1, TypographyMuted } from '~/components/ui/typography';
import {
  getLaunches,
  ILaunchResponse,
  ILaunchResult,
} from '~/services/launchService';
import { commitUrlSession, getUrlSession } from '~/sessions.server';

export async function loader({ request }: ClientLoaderFunctionArgs) {
  const session = await getUrlSession(request.headers.get('Cookie'));
  session.set('urlContext', request.url);

  const { env } = process;
  const queryURL = new URL(`${env.LL_BASE_URL}/launches/previous`);
  const url = new URL(request.url);

  const offset = url.searchParams.get('offset') || '0';
  const limit = url.searchParams.get('limit') || '40';

  queryURL.searchParams.append('offset', offset);
  queryURL.searchParams.append('limit', limit);
  queryURL.searchParams.append('ordering', '-net');

  const { data, error } = await getLaunches(queryURL.toString());
  if (error) {
    throw json({ error }, { status: 500 });
  }
  return json(
    {
      launches: data as ILaunchResponse,
    },
    { headers: { 'Set-Cookie': await commitUrlSession(session) } }
  );
}

export default function PastLaunches() {
  const { launches } = useLoaderData<typeof loader>();

  const [items, setItems] = useState<ILaunchResult[]>(launches.results);
  const [limit, setLimit] = useState(40);
  const [offset, setOffset] = useState(launches.results.length);
  const [hasMore, setHasMore] = useState(launches.next !== null);

  const [openDialogId, setOpenDialogId] = useState<string | null>(null);

  const fetcher = useFetcher<typeof loader>();
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (fetcher.data) {
      setItems((prevItems: ILaunchResult[]) => {
        const newItems = fetcher.data?.launches.results || [];
        const uniqueNewItems = newItems.filter(
          (newItem: ILaunchResult) =>
            !prevItems.some(
              (prevItem: ILaunchResult) => prevItem.id === newItem.id
            )
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
          fetcher.load(`/launches/past?offset=${offset}&limit=${limit}`);
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
          <TypographyH1>Past Launches</TypographyH1>
        </div>
        <TypographyMuted>Launches that have already occurred</TypographyMuted>
        {items?.length > 0 ? (
          <>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8'>
              {items.map((launch: ILaunchResult) => (
                <Dialog
                  key={launch.id}
                  open={launch.id == openDialogId}
                  onOpenChange={(open) =>
                    setOpenDialogId(open ? launch.id : null)
                  }
                >
                  <DialogTrigger asChild>
                    <div className='cursor-pointer'>
                      <LaunchCard launch={launch} />
                    </div>
                  </DialogTrigger>
                  <DialogContent className='max-w-3xl'>
                    <DialogHeader>
                      <DialogTitle>
                        <Link
                          onClick={() => setOpenDialogId(null)}
                          className='flex gap-2 items-center hover:underline underline-offset-2'
                          to={`/launch/${launch.id}`}
                        >
                          Launch Details{' '}
                          <ExternalLinkIcon className='h-4 w-4' />
                        </Link>
                      </DialogTitle>
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
          <div className='text-center'>No upcoming launches</div>
        )}
      </div>
    </main>
  );
}

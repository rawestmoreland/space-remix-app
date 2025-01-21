import {
  ClientLoaderFunctionArgs,
  useFetcher,
  useLoaderData,
} from '@remix-run/react';

import { json } from '@remix-run/node';

import { TypographyH1, TypographyMuted } from '~/components/ui/typography';

import { useEffect, useRef, useState } from 'react';
import {
  getLauncherConfigFamilies,
  getLauncherConfigs,
  ILauncherConfig,
  ILauncherConfigFamilyResponse,
  ILauncherConfigResponse,
} from '~/services/launcherService';
import { commitUrlSession, getUrlSession } from '~/sessions.server';
import { LauncherCard } from '~/components/vehicles/launcher-config-card';
import { Loader2Icon } from 'lucide-react';
import { Button } from '~/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';

export async function loader({ request }: ClientLoaderFunctionArgs) {
  const session = await getUrlSession(request.headers.get('Cookie'));
  session.set('urlContext', request.url);

  const { env } = process;
  const queryURL = new URL(`${env.LL_BASE_URL}/launcher_configurations`);
  const url = new URL(request.url);

  const offset = url.searchParams.get('offset') || '0';
  const limit = url.searchParams.get('limit') || '40';
  const families = url.searchParams.get('families');
  const active = url.searchParams.get('active');

  queryURL.searchParams.append('offset', offset);
  queryURL.searchParams.append('limit', limit);
  if (families && families !== 'All') {
    const familyId = parseInt(families);
    if (!isNaN(familyId)) {
      queryURL.searchParams.append('families', familyId.toString());
    }
  }
  if (active && active !== 'All') {
    queryURL.searchParams.append(
      'active',
      active === 'true' ? 'true' : 'false'
    );
  }

  const [launcherConfigsResponse, launcherConfigFamiliesResponse] =
    await Promise.all([
      getLauncherConfigs(queryURL.toString()),
      getLauncherConfigFamilies(
        `${env.LL_BASE_URL}/launcher_configuration_families?offset=0&limit=100`
      ),
    ]);

  if (launcherConfigsResponse.error || launcherConfigFamiliesResponse.error) {
    throw json(
      {
        error:
          launcherConfigsResponse.error || launcherConfigFamiliesResponse.error,
      },
      { status: 500 }
    );
  }

  return json(
    {
      launcherConfigs: launcherConfigsResponse.data as ILauncherConfigResponse,
      launcherConfigFamilies:
        launcherConfigFamiliesResponse.data as ILauncherConfigFamilyResponse,
    },
    {
      headers: { 'Set-Cookie': await commitUrlSession(session) },
    }
  );
}

export default function Vehicles() {
  const { launcherConfigFamilies, launcherConfigs } =
    useLoaderData<typeof loader>();

  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(40);
  const [hasMore, setHasMore] = useState(true);
  const [items, setItems] = useState<ILauncherConfig[]>(
    launcherConfigs.results
  );
  const [families, setFamilies] = useState<string | null>(null);
  const [active, setActive] = useState<string | null>(null);

  const fetcher = useFetcher<typeof loader>();
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (fetcher.data) {
      setItems((prevItems: ILauncherConfig[]) => {
        const newItems = fetcher.data?.launcherConfigs.results || [];
        const uniqueNewItems = newItems.filter(
          (newItem: ILauncherConfig) =>
            !prevItems.some(
              (prevItem: ILauncherConfig) => prevItem.id === newItem.id
            )
        );
        return [...prevItems, ...uniqueNewItems];
      });
      if (!fetcher.data.launcherConfigs?.next === null) {
        setHasMore(false);
        return;
      }
      if (fetcher.data.launcherConfigs.next === null) {
        setHasMore(false);
      } else {
        const url = new URL(fetcher.data.launcherConfigs.next);
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
          const params = new URLSearchParams();
          params.append('offset', offset.toString());
          params.append('limit', limit.toString());

          if (families && families !== 'All') {
            params.append('families', families);
          }

          if (active && active !== 'All') {
            params.append('active', active);
          }

          fetcher.load(`/vehicles?${params.toString()}`);
        }
      },
      { threshold: 1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, offset, limit, fetcher, families, active]);

  useEffect(() => {
    if (fetcher.state === 'idle') {
      setItems([]); // Reset items when filters change
      setOffset(0);
      setLimit(40);
      setHasMore(true);

      const params = new URLSearchParams();
      params.append('offset', '0');
      params.append('limit', '40');

      if (families && families !== 'All') {
        params.append('families', families);
      }

      if (active && active !== 'All') {
        params.append('active', active);
      }

      fetcher.load(`/vehicles?${params.toString()}`);
    }
  }, [families, active]);

  const handleClearFilters = () => {
    setFamilies(null);
    setActive(null);
  };

  const handleFamilyTagClick = (familyId: string) => {
    setItems([]); // Reset items when filter changes
    setOffset(0);
    setLimit(40);
    setHasMore(true);
    setFamilies(familyId);
  };

  return (
    <main className='flex-1'>
      <div className='flex flex-col gap-2 mx-auto mb-8 w-full max-w-6xl px-4 md:px-0'>
        <div className='my-4'>
          <TypographyH1>Vehicles</TypographyH1>
          <TypographyMuted>All launch vehicles</TypographyMuted>
        </div>
        <div className='flex gap-4'>
          <Select
            value={families || ''}
            onValueChange={(value) =>
              setFamilies(value === 'All' ? null : value)
            }
          >
            <SelectTrigger className='max-w-48'>
              <SelectValue placeholder='Select Family' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='All'>All</SelectItem>
              {launcherConfigFamilies.results.map((lcf) => {
                return (
                  <SelectItem key={lcf.id} value={lcf.id.toString()}>
                    {lcf.name}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          <Select
            value={active || ''}
            onValueChange={(value) => setActive(value === 'All' ? null : value)}
          >
            <SelectTrigger className='max-w-48'>
              <SelectValue placeholder='Status' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='All'>All</SelectItem>
              <SelectItem value='true'>Active</SelectItem>
              <SelectItem value='false'>Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Button variant='outline' onClick={handleClearFilters}>
            Clear
          </Button>
        </div>

        {items?.length > 0 ? (
          <>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2 mt-8'>
              {items.map((launcher: ILauncherConfig) => (
                <LauncherCard
                  key={launcher.id}
                  launcher={launcher}
                  onFamilyClick={handleFamilyTagClick}
                />
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
            No vehicles found
          </div>
        )}
      </div>
    </main>
  );
}

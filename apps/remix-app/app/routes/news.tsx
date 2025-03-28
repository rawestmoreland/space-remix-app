import {
  useLoaderData,
  json,
  ClientLoaderFunctionArgs,
  useFetcher,
} from '@remix-run/react';
import { Loader2Icon, SearchIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { NewsCard } from '~/components/news-card';
import { TypographyH1, TypographyMuted } from '~/components/ui/typography';
import { getArticles, IArticle } from '~/services/newsService';
import { Input } from '~/components/ui/input';

export const loader = async ({ request }: ClientLoaderFunctionArgs) => {
  const { env } = process;

  const queryURL = new URL(`${env.SF_NEWS_BASE_URL}/articles`);
  const url = new URL(request.url);

  const offset = url.searchParams.get('offset') || '0';
  const limit = url.searchParams.get('limit') || '40';
  const search = url.searchParams.get('search') || '';

  queryURL.searchParams.append('offset', offset);
  queryURL.searchParams.append('limit', limit);
  queryURL.searchParams.append('ordering', '-published_at');
  if (search) {
    queryURL.searchParams.append('search', search);
  }

  const { data, error } = await getArticles(queryURL.toString());
  if (error) {
    throw json({ error }, { status: 500 });
  }
  return { articles: data };
};

export default function News() {
  const { articles } = useLoaderData<typeof loader>();

  const [items, setItems] = useState<IArticle[]>(articles.results);
  const [limit, setLimit] = useState(40);
  const [offset, setOffset] = useState(articles.results.length);
  const [hasMore, setHasMore] = useState(articles.next !== null);
  const [searchTerm, setSearchTerm] = useState('');
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  const fetcher = useFetcher<typeof loader>();
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (fetcher.data) {
      setItems((prevItems: IArticle[]) => {
        const newItems = fetcher.data?.articles.results || [];
        const uniqueNewItems = newItems.filter(
          (newItem: IArticle) =>
            !prevItems.some((prevItem: IArticle) => prevItem.id === newItem.id)
        );
        return [...prevItems, ...uniqueNewItems];
      });
      if (!fetcher.data.articles?.next === null) {
        setHasMore(false);
        return;
      }
      if (fetcher.data.articles.next === null) {
        setHasMore(false);
      } else {
        const url = new URL(fetcher.data.articles.next);
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
            `/news?offset=${offset}&limit=${limit}&search=${searchTerm}`
          );
        }
      },
      { threshold: 1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, offset, limit, fetcher, searchTerm]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout to debounce search
    searchTimeoutRef.current = setTimeout(() => {
      setItems([]);
      setOffset(0);
      setHasMore(true);
      fetcher.load(`/news?search=${value}&offset=0&limit=${limit}`);
    }, 500);
  };

  return (
    <main className='flex-1'>
      <div className='mx-auto mb-8 w-full max-w-6xl px-4 md:px-0'>
        <div className='my-4'>
          <TypographyH1>Space News</TypographyH1>
        </div>
        <div>
          <TypographyMuted>
            The latest news from the space industry, including SpaceX, NASA, and
            more.
          </TypographyMuted>
        </div>

        <div className='relative mt-6 mb-8'>
          <SearchIcon className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-500' />
          <Input
            type='text'
            placeholder='Search articles...'
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className='pl-10'
          />
        </div>

        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {items.map((article: IArticle) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      </div>
      {hasMore && (
        <div
          ref={loaderRef}
          className='mx-auto mt-4 flex w-full items-center justify-center text-center text-primary'
        >
          <Loader2Icon className='h-8 w-8 animate-spin' />
        </div>
      )}
    </main>
  );
}

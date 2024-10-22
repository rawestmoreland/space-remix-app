import {
  useLoaderData,
  json,
  ClientLoaderFunctionArgs,
  useFetcher,
} from '@remix-run/react';
import { Loader2Icon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { NewsCard } from '~/components/news-card';
import { TypographyH1 } from '~/components/ui/typography';
import { getArticles, IArticle } from '~/services/newsService';

export const loader = async ({ request }: ClientLoaderFunctionArgs) => {
  const { env } = process;

  const queryURL = new URL(`${env.SF_NEWS_BASE_URL}/articles`);
  const url = new URL(request.url);

  const offset = url.searchParams.get('offset') || '0';
  const limit = url.searchParams.get('limit') || '40';

  queryURL.searchParams.append('offset', offset);
  queryURL.searchParams.append('limit', limit);
  queryURL.searchParams.append('ordering', '-published_at');

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
          fetcher.load(`/news?offset=${offset}&limit=${limit}`);
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
          <TypographyH1>News</TypographyH1>
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

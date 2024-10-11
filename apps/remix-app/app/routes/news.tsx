import { useLoaderData, json } from '@remix-run/react';
import { NewsCard } from '~/components/news-card';
import { TypographyH1 } from '~/components/ui/typography';
import { getArticles, IArticle } from '~/services/newsService';

export const loader = async () => {
  const { env } = process;
  const { data, error } = await getArticles(
    `${env.SF_NEWS_BASE_URL}/articles?ordering=-published_at`
  );
  if (error) {
    throw json({ error }, { status: 500 });
  }
  return { articles: data };
};

export default function News() {
  const { articles } = useLoaderData<typeof loader>();

  return (
    <main className='flex-1'>
      <div className='mx-auto mb-8 w-full max-w-6xl px-4 md:px-0'>
        <div className='my-4'>
          <TypographyH1>News</TypographyH1>
        </div>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {articles.results.map((article: IArticle) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      </div>
    </main>
  );
}

import { IArticle } from '~/services/newsService';
import { Card, CardContent, CardFooter } from './ui/card';
import { Badge } from './ui/badge';

export function NewsCard({ article }: { article: IArticle }) {
  return (
    <a
      key={article.id}
      href={article.url}
      rel='noopener noreferrer'
      target='_blank'
      className='group h-full'
    >
      <Card className='flex h-full flex-col overflow-hidden transition-all duration-300 hover:shadow-lg'>
        <div className='relative h-48 overflow-hidden'>
          <img
            src={article.image_url ?? '/placeholder-rocket.jpg'}
            alt={article.title}
            className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
          />
        </div>
        <CardContent className='flex-grow p-4'>
          <div className='flex flex-col mb-2 gap-1'>
            <h3 className='line-clamp-2 text-xl font-bold'>{article.title}</h3>
            <p className='text-muted-foreground text-xs'>
              {new Date(article.published_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <p className='line-clamp-3 text-sm'>{article.summary}</p>
        </CardContent>
        <CardFooter className='z-10 bg-background pt-4 flex flex-col items-start gap-2'>
          <Badge variant='default'>{article.news_site}</Badge>
        </CardFooter>
      </Card>
    </a>
  );
}

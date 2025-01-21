import { Card, CardContent, CardFooter } from '../ui/card';
import { Badge } from '../ui/badge';
import { IAstronaut } from '~/services/astronautService';
import { useMemo } from 'react';
import { Orbit } from 'lucide-react';
import { Link } from '@remix-run/react';

export function AstronautCard({ astronaut }: { astronaut: IAstronaut }) {
  const status = useMemo(() => {
    if (
      astronaut.status.name === 'Active' ||
      astronaut.status.name === 'Inactive'
    ) {
      return 'secondary';
    } else if (astronaut.status.name === 'Retired') {
      return 'outline';
    } else if (astronaut.status.name === 'Deceased') {
      return 'destructive';
    }

    return 'default';
  }, [astronaut.status.name]);

  return (
    <Card className='group flex h-full flex-col overflow-hidden transition-all duration-300 hover:shadow-lg'>
      <div className='relative h-48 overflow-hidden bg-muted'>
        {astronaut.in_space && (
          <div className='absolute right-2 top-2 z-10 flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-sm text-white backdrop-blur-sm'>
            <Orbit className='h-4 w-4 animate-pulse text-blue-400' />
            <span>In Space</span>
          </div>
        )}
        <img
          src={astronaut.image?.image_url ?? '/placeholder-rocket.jpg'}
          alt={astronaut.name}
          className='h-full w-full object-contain transition-transform duration-300 group-hover:scale-105'
        />
      </div>
      <CardContent className='flex-grow p-4'>
        <Link
          to={`/astronaut/${astronaut.id}`}
          className='hover:underline, decoration-primary'
        >
          <h3 className='mb-2 line-clamp-2 text-xl font-bold'>
            {astronaut.name}
          </h3>
        </Link>
        <Badge variant={status}>
          {astronaut.status?.name ?? 'Unknown Status'}
        </Badge>
        {/* <div className='mb-2 flex items-center'>
          <RocketIcon className='mr-2 h-4 w-4 text-muted-foreground' />
          <TypographyMuted>{}</TypographyMuted>
        </div> */}
        {/* <span className='line-clamp-6'>
          {astronaut.mission?.description ||
            `We have no details for this mission.`}
        </span> */}
      </CardContent>
      <CardFooter className='bg-background flex flex-col gap-2 pt-4 items-start'>
        <Badge className='line-clamp-1' variant='default'>
          {astronaut.agency?.name ?? 'Unknown Agency'}
        </Badge>
        {astronaut.image?.license && (
          <a
            href={astronaut.image.license.link}
            target='_blank'
            rel='noopener noreferrer'
            className='text-xs text-muted-foreground hover:underline'
          >
            Image: {astronaut.image.license.name}
          </a>
        )}
      </CardFooter>
    </Card>
  );
}

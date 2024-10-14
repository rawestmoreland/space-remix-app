import { Card, CardContent, CardFooter } from './ui/card';
import { Badge } from './ui/badge';
import { IAstronaut } from '~/services/astronautService';
import { useMemo } from 'react';

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
        <img
          src={astronaut.image?.image_url ?? '/placeholder-rocket.jpg'}
          alt={astronaut.name}
          className='h-full w-full object-contain transition-transform duration-300 group-hover:scale-105'
        />
      </div>
      <CardContent className='flex-grow p-4'>
        <h3 className='mb-2 line-clamp-2 text-xl font-bold'>
          {astronaut.name}
        </h3>
        <Badge variant={status}>{astronaut.status.name}</Badge>
        {/* <div className='mb-2 flex items-center'>
          <RocketIcon className='mr-2 h-4 w-4 text-muted-foreground' />
          <TypographyMuted>{}</TypographyMuted>
        </div> */}
        {/* <span className='line-clamp-6'>
          {astronaut.mission?.description ||
            `We have no details for this mission.`}
        </span> */}
      </CardContent>
      <CardFooter className='bg-background pt-4'>
        <Badge className='line-clamp-1' variant='default'>
          {astronaut.agency.name}
        </Badge>
      </CardFooter>
    </Card>
  );
}

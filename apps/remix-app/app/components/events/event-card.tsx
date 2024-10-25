import { Card, CardContent, CardFooter } from '../ui/card';
import { Badge } from '../ui/badge';
import { RocketIcon } from 'lucide-react';
import { TypographyMuted } from '../ui/typography';
import { IEventResult } from '~/services/eventsService';
import { formatDate, formatTime } from '~/lib/utils';

export function EventCard({ event }: { event: IEventResult }) {
  return (
    <Card className='group flex h-full flex-col overflow-hidden transition-all duration-300 hover:shadow-lg'>
      <div className='relative h-48 overflow-hidden'>
        <img
          src={event.image?.image_url ?? '/placeholder-rocket.jpg'}
          alt={event.name}
          className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
        />
      </div>
      <CardContent className='flex-grow p-4'>
        <h3 className='mb-2 line-clamp-2 text-xl font-bold'>{event.name}</h3>
        <div className='mb-2 flex items-center'>
          <RocketIcon className='mr-2 h-4 w-4 text-muted-foreground' />
          <TypographyMuted>
            {formatDate(event.date)} at {formatTime(event.date)}
          </TypographyMuted>
        </div>
        <span className='line-clamp-6'>
          {event.description || `We have no details for this mission.`}
        </span>
      </CardContent>
      <CardFooter className='bg-background pt-4'>
        <Badge className='line-clamp-1' variant='default'>
          {event.type.name}
        </Badge>
      </CardFooter>
    </Card>
  );
}

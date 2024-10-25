import { Badge } from '~/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ScrollArea } from '../ui/scroll-area';
import { TypographyP } from '../ui/typography';

import { IEventResult } from '~/services/eventsService';

export function EventDetail({ event }: { event: IEventResult }) {
  return (
    <ScrollArea className='max-h-[80vh] pr-4'>
      <div className='flex flex-col gap-4'>
        <div className='flex items-center gap-4'>
          <Avatar className='h-24 w-24'>
            <AvatarImage src={event.image?.image_url} alt={event.name} />
            <AvatarFallback>
              {event.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <Badge>{event.type.name}</Badge>
          </div>
        </div>
        <div>
          <TypographyP>{event.description}</TypographyP>
        </div>
      </div>
    </ScrollArea>
  );
}

import { isoDurationToHumanReadable } from '~/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { IAstronautResult } from '~/services/astronautService';
import { InstagramIcon, TwitterIcon } from 'lucide-react';

export function AstronautDetail({
  astronaut,
}: {
  astronaut: IAstronautResult;
}) {
  return (
    <ScrollArea className='max-h-[80vh] pr-4'>
      <div className='flex flex-col gap-4'>
        <div className='flex items-center gap-4'>
          <Avatar className='h-24 w-24'>
            <AvatarImage src={astronaut.image.image_url} alt={astronaut.name} />
            <AvatarFallback>
              {astronaut.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <Badge
              variant={
                astronaut.status.name === 'Active' ? 'default' : 'secondary'
              }
            >
              {astronaut.status.name}
            </Badge>
            <p className='mt-1 text-sm text-muted-foreground'>
              {astronaut.agency.name} ({astronaut.agency.abbrev})
            </p>
            <p className='text-sm text-muted-foreground'>
              {astronaut.nationality.map((n) => n.name).join(', ')}
            </p>
          </div>
        </div>
        <div className='grid grid-cols-2 gap-4 text-sm'>
          <div>
            <p className='font-semibold'>Age</p>
            <p>{astronaut.age}</p>
          </div>
          <div>
            <p className='font-semibold'>Date of Birth</p>
            <p>{new Date(astronaut.date_of_birth).toLocaleDateString()}</p>
          </div>
          <div>
            <p className='font-semibold'>Time in Space</p>
            <p>{isoDurationToHumanReadable(astronaut.time_in_space)}</p>
          </div>
          <div>
            <p className='font-semibold'>EVA Time</p>
            <p>{isoDurationToHumanReadable(astronaut.eva_time)}</p>
          </div>
          <div>
            <p className='font-semibold'>Flights</p>
            <p>{astronaut.flights_count}</p>
          </div>
          <div>
            <p className='font-semibold'>Landings</p>
            <p>{astronaut.landings_count}</p>
          </div>
          <div>
            <p className='font-semibold'>Spacewalks</p>
            <p>{astronaut.spacewalks_count}</p>
          </div>
        </div>
        <div>
          <p className='mb-2 font-semibold'>Biography</p>
          <p className='text-sm'>{astronaut.bio}</p>
        </div>
        <div>
          <p className='mb-2 font-semibold'>Social Media</p>
          <div className='flex gap-2'>
            {astronaut.social_media_links.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target='_blank'
                rel='noopener noreferrer'
                className='text-blue-500 hover:text-blue-700'
              >
                {link.social_media.name === 'Twitter' && (
                  <TwitterIcon className='h-5 w-5' />
                )}
                {link.social_media.name === 'Instagram' && (
                  <InstagramIcon className='h-5 w-5' />
                )}
              </a>
            ))}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}

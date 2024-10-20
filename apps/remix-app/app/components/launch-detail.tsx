import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { ILaunch } from '~/services/launchService';
import { TypographyH3, TypographyP } from './ui/typography';
import { ClipboardIcon, RocketIcon } from 'lucide-react';
import Countdown from 'react-countdown';
import { type CountdownRenderProps } from 'react-countdown';

export function LaunchDetail({ launch }: { launch: ILaunch }) {
  return (
    <ScrollArea className='max-h-[80vh] pr-4'>
      <div className='flex flex-col gap-4'>
        <div className='flex items-center gap-4'>
          <Avatar className='h-24 w-24'>
            <AvatarImage src={launch.image?.image_url} alt={launch.name} />
            <AvatarFallback>
              {launch.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <Badge
              variant={
                launch.status.abbrev.toLowerCase() === 'success'
                  ? 'secondary'
                  : 'destructive'
              }
            >
              {launch.status.name}
            </Badge>
            <p className='mt-1 text-sm text-muted-foreground'>
              {launch.launch_service_provider.name} (
              {launch.launch_service_provider.abbrev})
            </p>
            <p className='text-sm text-muted-foreground'>
              {launch.mission.name}
            </p>
          </div>
        </div>
        <div>
          <Countdown
            date={new Date(launch.net)}
            renderer={(props: CountdownRenderProps) => {
              return (
                <div className='font-orbitron font-semibold tracking-wider text-2xl text-green-600'>{`${props.formatted.days}:${props.formatted.hours}:${props.formatted.minutes}:${props.formatted.seconds}`}</div>
              );
            }}
          />
          <TypographyP>{launch.mission.description}</TypographyP>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2'>
          <div>
            <div className='flex items-center'>
              <RocketIcon className='mr-2 h-5 w-5 flex-shrink-0' />
              <TypographyH3>Rocket Details</TypographyH3>
            </div>
            <span className='font-medium'>Name: </span>
            <span>{launch.rocket.configuration.name}</span>
          </div>
          <div>
            <div className='flex items-center'>
              <ClipboardIcon className='mr-2 h-5 w-5 flex-shrink-0' />
              <TypographyH3>Mission Details</TypographyH3>
            </div>
            <div>
              <span className='font-medium'>Name: </span>
              <span>{launch.mission.name}</span>
            </div>
            <div>
              <span className='font-medium'>Type: </span>
              <span>{launch.mission.type}</span>
            </div>
          </div>
        </div>
        {!!launch.mission.agencies?.length && (
          <div className='flex flex-wrap gap-2'>
            {launch.mission.agencies.map((agency) => (
              <Badge key={agency.id} variant='default'>
                {agency.name}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </ScrollArea>
  );
}

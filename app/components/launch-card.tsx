import { ILaunch } from '~/services/launchService';
import { Card, CardContent, CardFooter } from './ui/card';
import { Badge } from './ui/badge';
import { RocketIcon } from 'lucide-react';
import { formatDate, formatTime } from '~/lib/utils';
import { TypographyMuted } from './ui/typography';

export function LaunchCard({ launch }: { launch: ILaunch }) {
  return (
    <Card className='group flex h-full flex-col overflow-hidden transition-all duration-300 hover:shadow-lg'>
      <div className='relative h-48 overflow-hidden'>
        <img
          src={launch.image?.image_url ?? '/placeholder-rocket.jpg'}
          alt={launch.name}
          className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
        />
      </div>
      <CardContent className='flex-grow p-4'>
        <h3 className='mb-2 line-clamp-2 text-xl font-bold'>{launch.name}</h3>
        <div className='mb-2 flex items-center'>
          <RocketIcon className='mr-2 h-4 w-4 text-muted-foreground' />
          <TypographyMuted>
            {formatDate(launch.net)} at {formatTime(launch.net)}
          </TypographyMuted>
        </div>
        <span className='line-clamp-6'>
          {launch.mission?.description ||
            `We have no details for this mission.`}
        </span>
      </CardContent>
      <CardFooter className='bg-background pt-4'>
        <Badge className='line-clamp-1' variant='default'>
          {launch.launch_service_provider.name}
        </Badge>
      </CardFooter>
    </Card>
  );
}

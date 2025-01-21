import { ILaunchResult } from '~/services/launchService';
import { Card, CardContent, CardFooter } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import {
  RocketIcon,
  MapPinIcon,
  CalendarIcon,
  ExternalLinkIcon,
  AlertCircleIcon,
  ClockIcon,
} from 'lucide-react';
import {
  formatDate,
  formatTime,
  getLaunchStatusColor,
  timeUntilLaunch,
} from '~/lib/utils';
import { TypographyMuted } from '~/components/ui/typography';
import { Link } from '@remix-run/react';

export function LaunchCard({ launch }: { launch: ILaunchResult }) {
  return (
    <Card className='group flex h-full flex-col overflow-hidden transition-all duration-300 hover:shadow-lg'>
      <div className='relative h-64 overflow-hidden'>
        <img
          src={launch.image?.image_url ?? '/placeholder-rocket.jpg'}
          alt={launch.name}
          className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
        />
        {/* Status Badge */}
        <div className='absolute top-2 right-2'>
          <Badge
            className={`${getLaunchStatusColor(launch.status.name)} px-2 py-1`}
          >
            {launch.status.name}
          </Badge>
        </div>
        {/* Countdown Badge */}
        <div className='absolute bottom-2 right-2'>
          <Badge variant='secondary' className='flex items-center gap-1'>
            <ClockIcon className='h-3 w-3' />
            {timeUntilLaunch(launch)}
          </Badge>
        </div>
      </div>

      <CardContent className='flex-grow p-4'>
        <Link
          to={`/launch/${launch.id}`}
          className='hover:underline decoration-primary'
        >
          <h3 className='mb-2 line-clamp-2 text-xl font-bold group-hover:text-primary transition-colors'>
            {launch.name}
          </h3>
        </Link>

        <div className='space-y-2 mb-4'>
          <div className='flex items-center'>
            <CalendarIcon className='mr-2 h-4 w-4 text-muted-foreground' />
            <TypographyMuted>
              {formatDate(launch.net)} at{' '}
              {formatTime({ dateString: launch.net })}
            </TypographyMuted>
          </div>

          {launch.pad && (
            <div className='flex items-center'>
              <MapPinIcon className='mr-2 h-4 w-4 text-muted-foreground' />
              <TypographyMuted className='line-clamp-1'>
                {launch.pad.name}, {launch.pad.location?.name}
              </TypographyMuted>
            </div>
          )}

          {launch.mission?.type && (
            <div className='flex items-center'>
              <RocketIcon className='mr-2 h-4 w-4 text-muted-foreground' />
              <TypographyMuted>{launch.mission.type}</TypographyMuted>
            </div>
          )}
        </div>

        <div className='relative'>
          <p className='line-clamp-3 text-sm'>
            {launch.mission?.description ||
              'Mission details are not available at this time.'}
          </p>
          {launch.mission?.description && (
            <div className='absolute bottom-0 right-0 bg-gradient-to-l from-background to-transparent px-2'>
              <Link
                to={`/launch/${launch.id}`}
                className='text-xs text-primary hover:underline'
              >
                Read more
              </Link>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className='bg-background flex flex-col gap-2 pt-4 items-start'>
        <div className='flex flex-wrap gap-2'>
          <Badge variant='default' className='line-clamp-1'>
            {launch.launch_service_provider.name}
          </Badge>
          {launch.mission?.orbit && (
            <Badge variant='secondary' className='line-clamp-1'>
              {launch.mission.orbit.name}
            </Badge>
          )}
        </div>

        <div className='flex w-full justify-between items-center text-xs text-muted-foreground'>
          {launch.image?.license && (
            <a
              href={launch.image.license.link}
              target='_blank'
              rel='noopener noreferrer'
              className='hover:underline flex items-center gap-1'
            >
              Image: {launch.image.license.name}
              <ExternalLinkIcon className='h-3 w-3' />
            </a>
          )}

          {launch.probability &&
            launch.probability >= 0 &&
            launch.probability <= 100 && (
              <div className='flex items-center gap-1'>
                <AlertCircleIcon className='h-3 w-3' />
                Launch probability: {launch.probability}%
              </div>
            )}
        </div>
      </CardFooter>
    </Card>
  );
}

export default LaunchCard;

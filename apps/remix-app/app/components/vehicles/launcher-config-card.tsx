import {
  BuildingIcon,
  GlobeIcon,
  ExternalLinkIcon,
  CheckIcon,
  XIcon,
} from 'lucide-react';

import { Badge } from '~/components/ui/badge';
import { Card, CardContent, CardFooter } from '~/components/ui/card';
import { ILauncherConfig } from '~/services/launcherService';

export function LauncherCard({
  launcher,
  onFamilyClick,
}: {
  launcher: ILauncherConfig;
  onFamilyClick?: (familyId: string) => void;
}) {
  return (
    <Card className='group flex h-full flex-col overflow-hidden transition-all duration-300 hover:shadow-lg'>
      <div className='relative h-64 overflow-hidden'>
        <img
          src={launcher.image?.image_url ?? '/placeholder-rocket.jpg'}
          alt={launcher.full_name}
          className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
        />
        {/* Status Badge */}
        <div className='absolute top-2 right-2'>
          <Badge
            variant={launcher.active ? 'default' : 'destructive'}
            className='px-2 py-1 flex items-center gap-1'
          >
            {launcher.active ? (
              <CheckIcon className='h-3 w-3' />
            ) : (
              <XIcon className='h-3 w-3' />
            )}
            {launcher.active ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </div>

      <CardContent className='flex-grow p-4'>
        <a
          href={launcher.wiki_url}
          target='_blank'
          rel='noopener noreferrer'
          className='hover:underline decoration-primary'
        >
          <h3 className='mb-2 line-clamp-2 text-xl font-bold group-hover:text-primary transition-colors'>
            {launcher.full_name}
          </h3>
        </a>

        <div className='space-y-2 mb-4'>
          <div className='flex items-center'>
            <BuildingIcon className='mr-2 h-4 w-4 text-muted-foreground' />
            <span className='text-sm text-muted-foreground line-clamp-1'>
              {launcher.manufacturer.name}
            </span>
          </div>

          <div className='flex items-center'>
            <GlobeIcon className='mr-2 h-4 w-4 text-muted-foreground' />
            <span className='text-sm text-muted-foreground'>
              {launcher.manufacturer.country[0].name}
            </span>
          </div>

          {launcher.manufacturer.description && (
            <div className='relative mt-2 flex flex-col gap-2'>
              <p className='line-clamp-3 text-sm'>
                {launcher.manufacturer.description}
              </p>
              {launcher.manufacturer.description.length > 150 && (
                <div className='flex justify-end'>
                  <a
                    href={launcher.wiki_url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-xs text-primary hover:underline'
                  >
                    Read more
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className='bg-background flex flex-col gap-2 pt-4 items-start'>
        <div className='flex flex-wrap gap-2'>
          {launcher.families.map((family) => (
            <Badge
              key={family.id}
              variant='secondary'
              className='line-clamp-1 cursor-pointer hover:bg-secondary/80'
              onClick={() => onFamilyClick?.(family.id.toString())}
            >
              {family.name}
            </Badge>
          ))}
          {launcher.reusable && (
            <Badge variant='outline' className='line-clamp-1'>
              Reusable
            </Badge>
          )}
        </div>

        <div className='flex w-full justify-between items-center text-xs text-muted-foreground'>
          {launcher.image?.credit && (
            <span className='flex items-center gap-1'>
              Image: {launcher.image.credit}
            </span>
          )}
          {launcher.info_url && (
            <a
              href={launcher.info_url}
              target='_blank'
              rel='noopener noreferrer'
              className='hover:underline flex items-center gap-1'
            >
              More Info
              <ExternalLinkIcon className='h-3 w-3' />
            </a>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

import { IAstronaut } from '~/services/astronautService';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { FootprintsIcon, RocketIcon } from 'lucide-react';

export function AstronautCard({ astronaut }: { astronaut: IAstronaut }) {
  return (
    <Card className='h-full'>
      <CardHeader className='flex flex-row items-center gap-4'>
        <Avatar className='h-16 w-16'>
          <AvatarImage src={astronaut.image.image_url} alt={astronaut.name} />
          <AvatarFallback>
            {astronaut.name
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </AvatarFallback>
        </Avatar>
        <div>
          <CardTitle>{astronaut.name}</CardTitle>
          <Badge
            variant={
              astronaut.status.name === 'Active' ? 'default' : 'secondary'
            }
          >
            {astronaut.status.name}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className='flex flex-col gap-4'>
        <div className='flex gap-2 text-sm'>
          <Badge variant='default'>
            <RocketIcon className='mr-2 h-4 w-4' />
            {astronaut.flights_count}
          </Badge>
          <Badge variant='default'>
            <FootprintsIcon className='mr-2 h-4 w-4' />
            {astronaut.spacewalks_count}
          </Badge>
          <Badge variant='default'>{astronaut.agency.abbrev}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}

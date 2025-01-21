import { LoaderFunctionArgs } from '@remix-run/node';
import { json, useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';
import {
  getAstronautById,
  IAstronautResult,
} from '~/services/astronautService';
import { AspectRatio } from '~/components/ui/aspect-ratio';
import { CalendarIcon, UserIcon, GlobeIcon, RocketIcon } from 'lucide-react';
import { getUrlSession } from '~/sessions.server';
import { AstronautBreadcrumbs } from '~/components/astronauts/astronaut-breadcrumbs';
import { isoDurationToHumanReadable } from '~/lib/utils';
import { Badge } from '~/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';

export async function loader({ params, request }: LoaderFunctionArgs) {
  const session = await getUrlSession(request.headers.get('Cookie'));
  const urlContext = session.get('urlContext');

  invariant(params.id, 'No astronaut id provided');

  const astronaut = await getAstronautById(
    `${process.env.LL_BASE_URL}/astronauts/${params.id}`
  );

  if (astronaut.error || !astronaut.data) {
    throw new Response('Not Found', { status: 404 });
  }

  return json({
    astronaut: astronaut.data as IAstronautResult,
    urlContext,
  });
}

export default function AstronautInfo() {
  const { astronaut } = useLoaderData<typeof loader>();

  return (
    <main className='container max-w-3xl mx-auto px-4 py-8'>
      <AstronautBreadcrumbs astronautName={astronaut.name} className='mb-8' />
      <h1 className='text-3xl font-bold mb-6'>{astronaut.name}</h1>

      <div className='grid md:grid-cols-2 gap-8'>
        <AspectRatio ratio={4 / 3} className='bg-muted shadow-xl rounded-xl'>
          <img
            src={astronaut.image?.image_url ?? '/placeholder-astronaut.jpg'}
            alt={astronaut.name}
            className='rounded-xl object-contain h-full w-full shadow-xl'
          />
          {astronaut.image?.license && (
            <div className='absolute bottom-0 right-0 bg-black/80 text-white text-xs p-1'>
              Photo credit:{' '}
              <a
                href={astronaut.image.license.link}
                target='_blank'
                rel='noopener noreferrer'
              >
                {astronaut.image.license.name}
              </a>
            </div>
          )}
        </AspectRatio>

        <div className='bg-card p-4 rounded-lg shadow-lg border border-muted space-y-4'>
          <div className='flex items-start space-x-2'>
            <CalendarIcon className='text-primary h-4 w-4 mt-1' />
            <span>
              Date of Birth:{' '}
              {new Date(astronaut.date_of_birth).toLocaleDateString()}
            </span>
          </div>
          <div className='flex items-start space-x-2'>
            <UserIcon className='text-green-500 h-4 w-4 mt-1' />
            <span>Status: {astronaut.status.name}</span>
          </div>
          <div className='flex items-start space-x-2'>
            <GlobeIcon className='text-blue-500 h-4 w-4 mt-1' />
            <span>
              Nationality: {astronaut.nationality.map((n) => n.name).join(', ')}
            </span>
          </div>
          <div className='flex items-start space-x-2'>
            <RocketIcon className='text-purple-500 h-4 w-4 mt-1' />
            <span>
              Agency: {astronaut.agency.name} ({astronaut.agency.abbrev})
            </span>
          </div>
        </div>
      </div>

      <div className='mt-8 space-y-6'>
        <section className='bg-card p-4 rounded-lg shadow-xl border border-muted'>
          <h2 className='text-2xl font-semibold mb-3'>Biography</h2>
          <p>{astronaut.bio}</p>
        </section>

        <Tabs defaultValue='experience' className='w-full'>
          <TabsList className='grid w-full grid-cols-2'>
            <TabsTrigger value='experience'>Experience</TabsTrigger>
            <TabsTrigger value='missions'>Past Missions</TabsTrigger>
          </TabsList>

          <TabsContent
            value='experience'
            className='bg-card p-4 rounded-lg shadow-xl border border-muted'
          >
            <h2 className='text-2xl font-semibold mb-3'>Space Experience</h2>
            <div className='space-y-2'>
              <div>
                Time in Space:{' '}
                {isoDurationToHumanReadable(astronaut.time_in_space)}
              </div>
              <div>Number of Flights: {astronaut.flights_count}</div>
              <div>Number of Landings: {astronaut.landings_count}</div>
              <div>Number of Spacewalks: {astronaut.spacewalks_count}</div>
              <div>
                EVA Time: {isoDurationToHumanReadable(astronaut.eva_time)}
              </div>
              <div>
                First Flight:{' '}
                {new Date(astronaut.first_flight).toLocaleDateString()}
              </div>
              <div>
                Last Flight:{' '}
                {new Date(astronaut.last_flight).toLocaleDateString()}
              </div>
            </div>
          </TabsContent>

          <TabsContent
            value='missions'
            className='bg-card p-4 rounded-lg shadow-xl border border-muted'
          >
            <h2 className='text-2xl font-semibold mb-3'>Past Missions</h2>
            <div className='space-y-4'>
              {astronaut.flights?.map((flight) => {
                return (
                  <div key={flight.id} className='border-b pb-4 last:border-0'>
                    <h3 className='font-semibold text-lg'>{flight.name}</h3>
                    <div className='flex items-center gap-2 mt-1'>
                      <Badge variant='outline'>
                        {new Date(flight.net).toLocaleDateString()}
                      </Badge>
                      <Badge
                        variant={
                          flight.status.name === 'Launch Successful'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {flight.status.name}
                      </Badge>
                    </div>
                    {flight.mission && (
                      <p className='mt-2 text-sm text-muted-foreground'>
                        {flight.mission.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        {astronaut.social_media_links.length > 0 && (
          <section className='bg-card p-4 rounded-lg shadow-xl border border-muted'>
            <h2 className='text-2xl font-semibold mb-3'>Social Media</h2>
            <ul className='space-y-2'>
              {astronaut.social_media_links.map((social, index) => (
                <li key={index}>
                  <a
                    href={social.url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-primary hover:underline'
                  >
                    {social.social_media.name}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}

import { LoaderFunctionArgs } from '@remix-run/node';
import { json, Link, useLoaderData } from '@remix-run/react';
import {
  ClockIcon,
  InfoIcon,
  MapPinIcon,
  RefreshCwIcon,
  RocketIcon,
} from 'lucide-react';
import invariant from 'tiny-invariant';
import { EventsBreadcrumbs } from '~/components/events/events-breadcrumbs';
import { AspectRatio } from '~/components/ui/aspect-ratio';
import { getEventById, IEventResult } from '~/services/eventsService';
import { getUrlSession } from '~/sessions.server';

export async function loader({ params, request }: LoaderFunctionArgs) {
  invariant(params.id, 'No id provided');

  const session = await getUrlSession(request.headers.get('Cookie'));
  const urlContext = session.get('urlContext');

  const response = await getEventById(
    `${process.env.LL_BASE_URL}/events/${params.id}`
  );

  if (response.error) {
    throw new Response('Not Found', { status: 404 });
  }

  return json({ event: response.data as IEventResult, urlContext });
}

export default function Event() {
  const { event, urlContext } = useLoaderData<typeof loader>();

  return (
    <div className='min-h-screen bg-gray-900 text-white p-8'>
      <div className='max-w-7xl mx-auto'>
        <EventsBreadcrumbs
          eventName={event.name}
          urlContext={urlContext}
          className='mb-8'
        />

        <h1 className='text-4xl font-bold mb-8'>{event.name}</h1>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
          {/* Main Image */}
          <div className='col-span-full'>
            <AspectRatio ratio={2.39 / 1}>
              <img
                src={event.image?.image_url ?? '/placeholder-rocket.jpg'}
                alt={event.name}
                className='rounded-lg object-cover w-full h-full'
              />
            </AspectRatio>
          </div>

          {/* Event Details */}
          <div className='bg-muted p-6 rounded-lg shadow-lg'>
            <h2 className='text-2xl font-semibold mb-4 text-muted-foreground'>
              Event Details
            </h2>
            <ul className='space-y-3'>
              <li className='flex items-start'>
                <ClockIcon className='mr-2 text-primary h-4 w-4 mt-1 flex-shrink-0' />
                <span>{new Date(event.date).toUTCString()}</span>
              </li>
              <li className='flex items-start'>
                <MapPinIcon className='mr-2 text-primary h-4 w-4 mt-1 flex-shrink-0' />
                <span>{event.location ?? 'Location unknown'}</span>
              </li>
              <li className='flex items-start'>
                <InfoIcon className='mr-2 text-primary h-4 w-4 mt-1 flex-shrink-0' />
                <span>{event.type?.name ?? 'Event type unknown'}</span>
              </li>
            </ul>
          </div>

          {/* Description */}
          <div className='bg-muted p-6 rounded-lg shadow-lg'>
            <h2 className='text-2xl font-semibold mb-4 text-muted-foreground'>
              Description
            </h2>
            <p>
              {event.description ||
                'We have no details for this event at the moment.'}
            </p>
          </div>

          {/* Agencies */}
          <div className='bg-muted p-6 rounded-lg shadow-lg'>
            <h2 className='text-2xl font-semibold mb-4 text-muted-foreground'>
              Agencies
            </h2>
            <ul className='space-y-2'>
              {event.agencies.map((agency) => (
                <li key={`agency-${agency.id}`} className='flex items-start'>
                  <RocketIcon className='mr-2 h-4 w-4 text-primary flex-shrink-0 mt-1' />
                  <span>
                    {agency.name} {`(${agency.type.name})`}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Updates */}
          <div className='col-span-full bg-muted p-6 rounded-lg shadow-lg'>
            <h2 className='text-2xl font-semibold mb-4 text-muted-foreground'>
              Updates
            </h2>
            <div className='space-y-4'>
              {event.updates.length ? (
                event.updates?.map((update, index) => (
                  <div key={index} className='flex items-center'>
                    <RefreshCwIcon className='mr-2 text-primary h-4 w-4 flex-shrink-0 ' />
                    <div>
                      <span className='font-semibold'>
                        {new Date(update.created_on).toUTCString()}:
                      </span>{' '}
                      {update.comment}
                    </div>
                  </div>
                ))
              ) : (
                <div>No updates available</div>
              )}
            </div>
          </div>

          {/* Related Launch */}
          <div className='col-span-full bg-muted p-6 rounded-lg shadow-lg'>
            <h2 className='text-2xl font-semibold mb-4 text-muted-foreground'>
              Related Launch
            </h2>
            {event.launches.length ? (
              event.launches.map((launch) => (
                <Link
                  to={`/launch/${launch.id}`}
                  key={`launch-${launch.id}`}
                  className='group'
                >
                  <div className='flex items-center space-x-4'>
                    <img
                      src={launch.image?.image_url ?? '/placeholder-rocket.jpg'}
                      alt={launch.name}
                      className='rounded-lg object-cover w-24'
                    />
                    <div className='w-1/2'>
                      <h3 className='text-xl font-semibold underline-offset-2 group-hover:underline'>
                        {launch.name}
                      </h3>
                      <p>Launch Date: {new Date(launch.net).toUTCString()}</p>
                      <p className='text-green-400'>
                        Status: {launch.status.name}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div>No related launches found</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

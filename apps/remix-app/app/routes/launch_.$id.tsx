import invariant from 'tiny-invariant';
import { LoaderFunctionArgs } from '@remix-run/node';
import { json, useLoaderData } from '@remix-run/react';
import { getLaunchById, ILaunchResult } from '~/services/launchService';
import { CalendarIcon, InfoIcon, MapPinIcon, RocketIcon } from 'lucide-react';
import { AspectRatio } from '~/components/ui/aspect-ratio';
import { Separator } from '~/components/ui/separator';
import { cn } from '~/lib/utils';
import { getUrlSession } from '~/sessions.server';
import { LaunchBreadcrumbs } from '~/components/launches/launch-breadcrumbs';

export async function loader({ params, request }: LoaderFunctionArgs) {
  const session = await getUrlSession(request.headers.get('Cookie'));
  const urlContext = session.get('urlContext');

  invariant(params.id, 'No launch id provided');

  const launch = await getLaunchById(
    `${process.env.LL_BASE_URL}/launches/${params.id}`
  );

  if (launch.error || !launch.data) {
    throw new Response('Not Found', { status: 404 });
  }

  return json({ launch: launch.data as ILaunchResult, urlContext });
}

export default function LaunchInfo() {
  const { launch, urlContext } = useLoaderData<typeof loader>();

  return (
    <main className='container max-w-3xl mx-auto px-4 py-8'>
      <LaunchBreadcrumbs
        launchName={launch.name}
        urlContext={urlContext}
        className='mb-8'
      />

      <h1 className='text-3xl font-bold mb-6'>{launch.name}</h1>

      <div className='grid md:grid-cols-2 gap-8'>
        <AspectRatio ratio={4 / 3} className='bg-muted shadow-xl rounded-xl'>
          <img
            src={launch.image?.image_url ?? '/placeholder-rocket.jpg'}
            alt={launch.name}
            className='rounded-xl object-cover h-full w-full shadow-xl'
          />
        </AspectRatio>

        <div className='bg-card p-4 rounded-lg shadow-lg border border-muted space-y-4'>
          <div className='flex items-start space-x-2'>
            <CalendarIcon className='text-primary h-4 w-4 mt-1' />
            <span>Launch Date: {new Date(launch.net).toUTCString()}</span>
          </div>
          <div className='flex items-start space-x-2'>
            <MapPinIcon className='text-green-500 h-4 w-4 mt-1' />
            <span>
              Launch Site:{' '}
              {launch.pad?.location?.name ?? 'No pad information available'}
            </span>
          </div>
          <div className='flex items-start space-x-2'>
            <RocketIcon className='text-destructive h-4 w-4 mt-1' />
            <span>
              Launch Vehicle:{' '}
              {launch.rocket?.configuration?.full_name ??
                'No launch vehicle details available'}
            </span>
          </div>
          <div className='flex items-start space-x-2'>
            <InfoIcon className='text-purple-500 h-4 w-4 mt-1' />
            <span>
              Status: {launch.status?.name ?? 'No launch status available'}
            </span>
          </div>
        </div>
      </div>

      <div className='mt-8 space-y-6'>
        {launch.failreason && (
          <section className='bg-card p-4 rounded-lg shadow-xl border border-muted'>
            <h2 className='text-2xl font-semibold mb-3'>What happened?</h2>
            <p>{launch.failreason}</p>
          </section>
        )}

        <section className='bg-card p-4 rounded-lg shadow-xl border border-muted'>
          <h2 className='text-2xl font-semibold mb-3'>Mission Details</h2>
          <p>
            {launch.mission.description ||
              'No mission details available at this time.'}
          </p>
        </section>

        <section className='bg-card p-4 rounded-lg shadow-xl border border-muted'>
          <h2 className='text-2xl font-semibold mb-3'>
            Launch Service Provider
          </h2>
          <p>
            {launch.launch_service_provider
              ? `${launch.launch_service_provider.name} (${launch.launch_service_provider.abbrev})`
              : 'Launch service provider unknown'}
          </p>
        </section>

        <section className='bg-card p-4 rounded-lg shadow-xl border border-muted'>
          <h2 className='text-2xl font-semibold mb-3'>Rocket Information</h2>
          <ul className='list-disc list-inside space-y-2'>
            <li>Configuration: {launch.rocket.configuration.name}</li>
            <li>
              Manufacturer: {launch.rocket.configuration.manufacturer.name}
            </li>
            <li>
              Payload Capacity to LEO:{' '}
              {launch.rocket.configuration.leo_capacity} kg
            </li>
            <li>Height: {launch.rocket.configuration.length} meters</li>
            <li>Diameter: {launch.rocket.configuration.diameter} meters</li>
          </ul>
        </section>

        <section className='bg-card p-4 rounded-lg shadow-xl border border-muted'>
          <h2 className='text-2xl font-semibold mb-3'>Launch Pad</h2>
          <p>
            {launch.pad.location.name} {launch.pad.name}
          </p>
        </section>

        <section className='bg-card p-4 rounded-lg shadow-xl border border-muted'>
          <h2 className='text-2xl font-semibold mb-3'>Updates</h2>
          <ul className='space-y-2'>
            {launch.updates
              .sort(
                (a, b) =>
                  new Date(b.created_on).getTime() -
                  new Date(a.created_on).getTime()
              )
              .map((update, index) => (
                <li key={update.id} className='space-y-2'>
                  <p className='text-xs'>
                    {new Date(update.created_on).toUTCString()}
                  </p>
                  <p className='text-sm'>{update.comment}</p>
                  <div className='flex items-baseline space-x-2'>
                    {/* <Avatar className='border p-1'>
                    <AvatarImage src={update.profile_image} />
                    <AvatarFallback>{update.created_by[0]}</AvatarFallback>
                    </Avatar> */}
                    <p className='text-xs'>by {update.created_by}</p>
                  </div>
                  <Separator
                    className={cn(
                      index === launch.updates.length - 1 ? 'hidden' : ''
                    )}
                  />
                </li>
              ))}
          </ul>
        </section>
      </div>
    </main>
  );
}

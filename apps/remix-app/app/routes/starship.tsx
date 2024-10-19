import { useLoaderData, json } from '@remix-run/react';
import { LivestreamCard } from '~/components/livestream-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { TypographyH1 } from '~/components/ui/typography';
import { VehicleCard } from '~/components/vehicle-card';
import {
  getStarshipDashboard,
  IStarshipLiveStream,
  IStarshipVehicle,
} from '~/services/starshipDashboardService';

export async function loader() {
  const { env } = process;
  const { data, error } = await getStarshipDashboard(
    `${env.LL_BASE_URL!}/dashboard/starship`
  );
  if (error) {
    throw json({ error }, { status: 500 });
  }
  return json({ dashboard: data });
}

export default function StarshipDashboard() {
  const { dashboard } = useLoaderData<typeof loader>();

  if (!dashboard) {
    return <div>We couldn&apos;t find any Starship updates</div>;
  }

  return (
    <main className='flex-1'>
      <div className='mx-auto w-full max-w-6xl px-4 md:px-0'>
        <div className='mb-4 mt-4'>
          <TypographyH1>Starship Dashboard</TypographyH1>
        </div>
        <Tabs defaultValue='live-streams' className='w-full'>
          <TabsList className='grid w-full grid-cols-2'>
            <TabsTrigger value='live-streams'>Live Streams</TabsTrigger>
            <TabsTrigger value='vehicles'>Vehicles</TabsTrigger>
          </TabsList>
          <TabsContent value='live-streams'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
              {dashboard.live_streams.map((stream: IStarshipLiveStream) => (
                <LivestreamCard key={stream.title} livestream={stream} />
              ))}
            </div>
          </TabsContent>
          <TabsContent value='vehicles'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4'>
              {dashboard.vehicles.map((vehicle: IStarshipVehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

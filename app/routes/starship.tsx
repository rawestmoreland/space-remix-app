import { AvatarImage } from '@radix-ui/react-avatar';
import { useLoaderData, json } from '@remix-run/react';
import { ExternalLinkIcon } from 'lucide-react';
import { LivestreamCard } from '~/components/livestream-card';
import { Avatar, AvatarFallback } from '~/components/ui/avatar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { TypographyH1, TypographyP } from '~/components/ui/typography';
import { VehicleCard } from '~/components/vehicle-card';
import { formatDate } from '~/lib/utils';
import {
  getStarshipDashboard,
  IStarshipLiveStream,
  IStarshipUpdate,
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
        <Tabs defaultValue='updates' className='w-full'>
          <TabsList className='grid w-full grid-cols-3'>
            <TabsTrigger value='updates'>Updates</TabsTrigger>
            <TabsTrigger value='live-streams'>Live Streams</TabsTrigger>
            <TabsTrigger value='vehicles'>Vehicles</TabsTrigger>
          </TabsList>
          <TabsContent value='updates'>
            {dashboard.updates.map((update: IStarshipUpdate) => (
              <Card key={update.id} className='mb-4'>
                <CardHeader>
                  <div className='flex items-center space-x-4'>
                    <Avatar>
                      <AvatarImage
                        src={update.profile_image}
                        alt={update.created_by[0]}
                      />
                      <AvatarFallback>{update.created_by}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>{update.created_by}</CardTitle>
                      <CardDescription>
                        {formatDate(update.created_on)}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <TypographyP>{update.comment}</TypographyP>
                  {update.info_url && (
                    <a
                      href={update.info_url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='mt-2 inline-block text-primary hover:underline'
                    >
                      More Info{' '}
                      <ExternalLinkIcon className='ml-1 inline-block h-4 w-4' />
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>
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

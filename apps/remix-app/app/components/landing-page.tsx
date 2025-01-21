import { Link } from '@remix-run/react';
import {
  Users,
  MapPin,
  Rocket,
  Award,
  Globe2,
  ArrowRight,
  RocketIcon,
  MoonIcon,
  DollarSignIcon,
  Calendar,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card';

import { ILaunchResponse } from '~/services/launchService';
import { IAstronautResult } from '~/services/astronautService';
import { ILocationResult } from '~/services/locationService';

export const kennedy = 27;
export const baikonur = 15;
export const guiana = 13;
export const brownsville = 143;

const facilities = [
  {
    name: 'Kennedy Space Center',
    id: kennedy,
    location: 'Florida, USA',
    description:
      'Historic NASA facility in Florida, USA. Home to the Apollo and Space Shuttle programs.',
    launches: 197,
    nextLaunch: '2025-01-24',
    image:
      'https://thespacedevs-prod.nyc3.digitaloceanspaces.com/media/images/cape_canaveral__image_20240918151615.jpg',
    coordinates: '28.5728° N, 80.6490° W',
  },
  {
    name: 'Baikonur Cosmodrome',
    id: baikonur,
    location: 'Kazakhstan',
    description:
      "World's first spaceport, located in Kazakhstan. Launch site for Soyuz missions to the ISS.",
    launches: 1350,
    nextLaunch: '2025-02-01',
    image:
      'https://thespacedevs-prod.nyc3.digitaloceanspaces.com/media/images/soyuz_launch_pa_image_20240918150530.jpg',
    coordinates: '45.9646° N, 63.3052° E',
  },
  {
    name: 'Guiana Space Center',
    id: guiana,
    location: 'French Guiana',
    description:
      'European spaceport near the equator, perfect for launches to geostationary orbit.',
    launches: 870,
    nextLaunch: '2025-01-30',
    image:
      'https://thespacedevs-prod.nyc3.digitaloceanspaces.com/media/images/vega_2526_aria_image_20240918154413.jpg',
    coordinates: '5.2322° N, 52.7603° W',
  },
  {
    name: 'Starbase',
    id: brownsville,
    location: 'Texas, USA',
    description:
      "SpaceX's newest launch facility in Texas, focused on Starship development and testing.",
    launches: 12,
    nextLaunch: '2025-02-15',
    image:
      'https://thespacedevs-prod.nyc3.digitaloceanspaces.com/media/images/spacex_starbase_image_20240919170357.jpg',
    coordinates: '25.9971° N, 97.1554° W',
  },
];

const LandingPage = ({
  astronauts,
  totalLaunches,
  launchesThisWeek,
  nextLaunches,
  locationData,
}: {
  astronauts: IAstronautResult[];
  totalLaunches: number;
  launchesThisWeek: number;
  nextLaunches?: {
    guiana: ILaunchResponse;
    kennedy: ILaunchResponse;
    baikonur: ILaunchResponse;
    brownsville: ILaunchResponse;
  };
  locationData: {
    guiana: ILocationResult;
    kennedy: ILocationResult;
    baikonur: ILocationResult;
    brownsville: ILocationResult;
  };
}) => {
  return (
    <div className='flex flex-col'>
      {/* Hero Section */}
      <section className='relative pt-16 pb-20 overflow-hidden'>
        {/* Animated background elements */}
        <div className='absolute inset-0 overflow-hidden'>
          <div className='absolute -top-1/2 -right-1/2 w-[1000px] h-[1000px] rounded-full bg-primary/5 blur-3xl animate-slow-spin'></div>
          <div className='absolute -bottom-1/2 -left-1/2 w-[800px] h-[800px] rounded-full bg-primary/10 blur-3xl animate-reverse-slow-spin'></div>
        </div>

        <div className='container relative mx-auto px-4'>
          <div className='flex flex-col items-center text-center'>
            <div className='relative'>
              <h1 className='text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent animate-gradient-x'>
                Explore Space Launch History
              </h1>
              {/* Decorative underline */}
              <div className='absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 mb-4 bg-gradient-to-r from-primary/0 via-primary to-primary/0'></div>
            </div>

            <p className='text-lg md:text-xl text-muted-foreground max-w-2xl mb-8 relative z-10 drop-shadow-sm'>
              Track past, present, and future space missions from every space
              agency worldwide. Get detailed insights into launches, astronauts,
              and space exploration milestones.
            </p>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl'>
              {/* Total Launches Card */}
              <Link to='/launches'>
                <Card className='group hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 relative overflow-hidden cursor-pointer'>
                  <div className='absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
                  <CardContent className='p-6 flex flex-col items-center relative'>
                    <div className='bg-primary/10 rounded-full p-4 mb-3 group-hover:scale-110 transition-transform duration-300'>
                      <Rocket className='h-8 w-8 text-primary group-hover:rotate-12 transition-transform duration-300' />
                    </div>
                    <p className='text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent'>
                      {totalLaunches}
                    </p>
                    <p className='text-sm text-muted-foreground font-medium'>
                      Total Launches
                    </p>
                  </CardContent>
                </Card>
              </Link>

              {/* Active Astronauts Card */}
              <Link to='/astronauts/in-space'>
                <Card className='group hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 relative overflow-hidden cursor-pointer'>
                  <div className='absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
                  <CardContent className='p-6 flex flex-col items-center relative'>
                    <div className='bg-primary/10 rounded-full p-4 mb-3 group-hover:scale-110 transition-transform duration-300'>
                      <Users className='h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-300' />
                    </div>
                    <p className='text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent'>
                      {astronauts?.length || 0}
                    </p>
                    <p className='text-sm text-muted-foreground font-medium'>
                      Active Astronauts
                    </p>
                  </CardContent>
                </Card>
              </Link>

              {/* Launches this week card */}
              <Link to='/launches/upcoming'>
                <Card className='group hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 relative overflow-hidden cursor-pointer'>
                  <div className='absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
                  <CardContent className='p-6 flex flex-col items-center relative'>
                    <div className='bg-primary/10 rounded-full p-4 mb-3 group-hover:scale-110 transition-transform duration-300'>
                      <Award className='h-8 w-8 text-primary group-hover:rotate-12 transition-transform duration-300' />
                    </div>
                    <p className='text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent'>
                      {launchesThisWeek}
                    </p>
                    <p className='text-sm text-muted-foreground font-medium'>
                      Launches This Week
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Space Achievements Section */}
      <section className='py-12 relative overflow-hidden'>
        {/* Background gradient effect */}
        <div className='absolute inset-0 bg-gradient-to-b from-muted/50 to-background'></div>

        {/* Subtle background pattern - optional */}
        <div className='absolute inset-0 bg-grid-pattern opacity-5'></div>

        <div className='container relative mx-auto px-4'>
          <div className='flex flex-col items-center text-center mb-12'>
            <h2 className='text-3xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent'>
              Latest Space Achievements
            </h2>
            <div className='h-1 w-20 bg-gradient-to-r from-primary/0 via-primary to-primary/0'></div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            {/* SpaceX Card */}
            <Link to='/news/spacex'>
              <Card className='group hover:shadow-lg transition-all duration-300 relative overflow-hidden cursor-pointer min-h-[300px]'>
                <div className='absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>

                <CardHeader>
                  <div className='mb-3 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300'>
                    <RocketIcon className='h-6 w-6 text-primary group-hover:rotate-12 transition-transform duration-300' />
                  </div>
                  <CardTitle className='group-hover:text-primary transition-colors'>
                    SpaceX Starship Progress
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <p className='text-muted-foreground mb-4'>
                    Track the development of humanity&apos;s most powerful
                    rocket, designed to revolutionize space travel and enable
                    Mars colonization.
                  </p>
                  <div className='flex items-center text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 -translate-x-2 group-hover:translate-x-0'>
                    <span className='text-sm font-medium mr-1'>Learn more</span>
                    <ArrowRight className='h-4 w-4' />
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Artemis Card */}
            <Link to='/news/artemis'>
              <Card className='group hover:shadow-lg transition-all duration-300 relative overflow-hidden cursor-pointer min-h-[300px]'>
                <div className='absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>

                <CardHeader>
                  <div className='mb-3 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300'>
                    <MoonIcon className='h-6 w-6 text-primary group-hover:rotate-12 transition-transform duration-300' />
                  </div>
                  <CardTitle className='group-hover:text-primary transition-colors'>
                    Artemis Program Updates
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <p className='text-muted-foreground mb-4'>
                    Follow NASA&apos;s ambitious plan to return humans to the
                    Moon and establish sustainable lunar presence by 2025.
                  </p>
                  <div className='flex items-center text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 -translate-x-2 group-hover:translate-x-0'>
                    <span className='text-sm font-medium mr-1'>Learn more</span>
                    <ArrowRight className='h-4 w-4' />
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Commercial Space Card */}
            <Link to='/news/commercial-space'>
              <Card className='group hover:shadow-lg transition-all duration-300 relative overflow-hidden cursor-pointer min-h-[300px]'>
                <div className='absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>

                <CardHeader>
                  <div className='mb-3 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300'>
                    <DollarSignIcon className='h-6 w-6 text-primary group-hover:rotate-12 transition-transform duration-300' />
                  </div>
                  <CardTitle className='group-hover:text-primary transition-colors'>
                    Commercial Space Growth
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <p className='text-muted-foreground mb-4'>
                    Discover how private companies are transforming space
                    exploration and creating new opportunities in orbit.
                  </p>
                  <div className='flex items-center text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 -translate-x-2 group-hover:translate-x-0'>
                    <span className='text-sm font-medium mr-1'>Learn more</span>
                    <ArrowRight className='h-4 w-4' />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Educational Section */}
      <section className='py-12 relative'>
        {/* Subtle animated gradient background */}
        <div className='absolute inset-0 bg-grid-pattern opacity-5'></div>

        <div className='container mx-auto px-4'>
          <div className='flex flex-col items-center text-center mb-12'>
            <h2 className='text-3xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent'>
              Understanding Space Flight
            </h2>
            <div className='h-1 w-20 bg-gradient-to-r from-primary/0 via-primary to-primary/0'></div>
            <p className='mt-4 text-muted-foreground max-w-2xl'>
              Explore the fundamental concepts that make space exploration
              possible
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
            {/* Launch Vehicles Card */}
            <Link to='/vehicles'>
              <Card className='group hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer'>
                <CardContent className='p-6'>
                  <div className='flex items-center gap-3 mb-6'>
                    <div className='bg-primary/10 rounded-full p-3 group-hover:scale-110 transition-transform duration-300'>
                      <Rocket className='h-6 w-6 text-primary group-hover:rotate-12 transition-transform duration-300' />
                    </div>
                    <h3 className='text-xl font-semibold group-hover:text-primary transition-colors'>
                      Launch Vehicles
                    </h3>
                  </div>

                  <p className='text-muted-foreground mb-6 min-h-[80px]'>
                    Modern rockets come in various sizes and capabilities, from
                    small satellite launchers to heavy-lift vehicles. Each
                    design represents a careful balance between payload
                    capacity, cost, and reliability.
                  </p>

                  <div className='space-y-4'>
                    <div className='group/item relative overflow-hidden rounded-lg border p-4 hover:border-primary/50 transition-colors'>
                      <div className='absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity'></div>
                      <div className='relative flex items-center gap-3'>
                        <div className='bg-primary/10 rounded-full p-2 group-hover/item:scale-110 transition-transform'>
                          <Rocket className='h-4 w-4 text-primary' />
                        </div>
                        <div>
                          <div className='font-medium'>
                            Small Launch Vehicles
                          </div>
                          <div className='text-sm text-muted-foreground'>
                            0-2,000 kg to LEO
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className='group/item relative overflow-hidden rounded-lg border p-4 hover:border-primary/50 transition-colors'>
                      <div className='absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity'></div>
                      <div className='relative flex items-center gap-3'>
                        <div className='bg-primary/10 rounded-full p-2 group-hover/item:scale-110 transition-transform'>
                          <Rocket className='h-4 w-4 text-primary' />
                        </div>
                        <div>
                          <div className='font-medium'>
                            Medium Launch Vehicles
                          </div>
                          <div className='text-sm text-muted-foreground'>
                            2,000-20,000 kg to LEO
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className='group/item relative overflow-hidden rounded-lg border p-4 hover:border-primary/50 transition-colors'>
                      <div className='absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity'></div>
                      <div className='relative flex items-center gap-3'>
                        <div className='bg-primary/10 rounded-full p-2 group-hover/item:scale-110 transition-transform'>
                          <Rocket className='h-4 w-4 text-primary' />
                        </div>
                        <div>
                          <div className='font-medium'>
                            Heavy Launch Vehicles
                          </div>
                          <div className='text-sm text-muted-foreground'>
                            20,000+ kg to LEO
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='mt-6 flex items-center text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 -translate-x-2 group-hover:translate-x-0'>
                    <span className='text-sm font-medium mr-1'>
                      Learn more about launch vehicles
                    </span>
                    <ArrowRight className='h-4 w-4' />
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Orbits Card */}
            <Card className='group hover:shadow-lg transition-all duration-300 overflow-hidden'>
              <CardContent className='p-6'>
                <div className='flex items-center gap-3 mb-6'>
                  <div className='bg-primary/10 rounded-full p-3 group-hover:scale-110 transition-transform duration-300'>
                    <Globe2 className='h-6 w-6 text-primary group-hover:rotate-12 transition-transform duration-300' />
                  </div>
                  <h3 className='text-xl font-semibold group-hover:text-primary transition-colors'>
                    Orbits and Trajectories
                  </h3>
                </div>

                <p className='text-muted-foreground mb-6 min-h-[80px]'>
                  Different missions require different orbits. Understanding
                  orbital mechanics is crucial for successful space missions.
                </p>

                <div className='space-y-4'>
                  <div className='group/item relative overflow-hidden rounded-lg border p-4 hover:border-primary/50 transition-colors'>
                    <div className='absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity'></div>
                    <div className='relative flex items-center gap-3'>
                      <div className='bg-primary/10 rounded-full p-2 group-hover/item:scale-110 transition-transform'>
                        <Globe2 className='h-4 w-4 text-primary' />
                      </div>
                      <div>
                        <div className='font-medium'>Low Earth Orbit (LEO)</div>
                        <div className='text-sm text-muted-foreground'>
                          160-2,000 km
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='group/item relative overflow-hidden rounded-lg border p-4 hover:border-primary/50 transition-colors'>
                    <div className='absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity'></div>
                    <div className='relative flex items-center gap-3'>
                      <div className='bg-primary/10 rounded-full p-2 group-hover/item:scale-110 transition-transform'>
                        <Globe2 className='h-4 w-4 text-primary' />
                      </div>
                      <div>
                        <div className='font-medium'>
                          Medium Earth Orbit (MEO)
                        </div>
                        <div className='text-sm text-muted-foreground'>
                          2,000-35,786 km
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='group/item relative overflow-hidden rounded-lg border p-4 hover:border-primary/50 transition-colors'>
                    <div className='absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity'></div>
                    <div className='relative flex items-center gap-3'>
                      <div className='bg-primary/10 rounded-full p-2 group-hover/item:scale-110 transition-transform'>
                        <Globe2 className='h-4 w-4 text-primary' />
                      </div>
                      <div>
                        <div className='font-medium'>
                          Geostationary Orbit (GEO)
                        </div>
                        <div className='text-sm text-muted-foreground'>
                          35,786 km
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className='mt-6 flex items-center text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 -translate-x-2 group-hover:translate-x-0'>
                  <span className='text-sm font-medium mr-1'>
                    Learn more about orbits
                  </span>
                  <ArrowRight className='h-4 w-4' />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Launch Sites Section */}
      <section className='py-12 relative overflow-hidden'>
        {/* Background gradients */}
        <div className='absolute inset-0 bg-gradient-to-b from-background via-muted/50 to-background'></div>
        <div className='absolute inset-0 bg-grid-pattern opacity-5'></div>

        <div className='container relative mx-auto px-4'>
          <div className='flex flex-col items-center text-center mb-12'>
            <h2 className='text-3xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent'>
              Global Launch Facilities
            </h2>
            <div className='h-1 w-20 bg-gradient-to-r from-primary/0 via-primary to-primary/0'></div>
            <p className='mt-4 text-muted-foreground max-w-2xl'>
              Discover the world&apos;s most advanced spaceports enabling
              humanity&apos;s journey to the stars
            </p>
          </div>

          {nextLaunches && (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {facilities.map((facility, index) => {
                const matchingLaunch = Object.values(nextLaunches).find(
                  (nl) => nl?.results[0]?.pad?.location?.id === facility.id
                );
                const matchingLocation = Object.values(locationData).find(
                  (ld) => ld?.id === facility.id
                );

                return (
                  <Card
                    key={index}
                    className='group hover:shadow-lg transition-all duration-300 relative overflow-hidden'
                  >
                    {/* Hover gradient overlay */}
                    <div className='absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>

                    {/* Facility image */}
                    <div className='relative h-48 overflow-hidden'>
                      <img
                        src={facility.image}
                        alt={facility.name}
                        loading='lazy'
                        className='w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500'
                      />
                      <div className='absolute inset-0 bg-gradient-to-t from-background to-transparent'></div>
                      <div className='absolute bottom-4 left-4 flex items-center text-sm text-white'>
                        <MapPin className='h-4 w-4 mr-1' />
                        {facility.coordinates}
                      </div>
                    </div>

                    <CardHeader className='relative pb-2'>
                      <div className='flex items-center gap-3'>
                        <div className='bg-primary/10 rounded-full p-2 group-hover:scale-110 transition-transform duration-300'>
                          <MapPin className='h-5 w-5 text-primary group-hover:rotate-12 transition-transform duration-300' />
                        </div>
                        <h3 className='text-lg font-semibold group-hover:text-primary transition-colors'>
                          {facility.name}
                        </h3>
                      </div>
                    </CardHeader>

                    <CardContent className='relative'>
                      <p className='text-sm text-muted-foreground mb-4'>
                        {facility.description}
                      </p>

                      <div className='grid grid-cols-2 gap-4 mb-4'>
                        <div className='flex flex-col'>
                          <div className='text-xs text-muted-foreground'>
                            Total Launches
                          </div>
                          <div className='flex items-center mt-1'>
                            <Rocket className='h-4 w-4 text-primary mr-1' />
                            <span className='font-medium'>
                              {matchingLocation?.total_launch_count ??
                                'Unknown'}
                            </span>
                          </div>
                        </div>
                        <div className='flex flex-col'>
                          <div className='text-xs text-muted-foreground'>
                            Next Launch
                          </div>
                          <div className='flex items-center mt-1'>
                            <Calendar className='h-4 w-4 text-primary mr-1' />
                            <span className='font-medium'>
                              {matchingLaunch?.results[0]?.net
                                ? new Date(
                                    matchingLaunch?.results[0]?.net
                                  ).toUTCString()
                                : 'Unknown'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className='flex items-center text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 -translate-x-2 group-hover:translate-x-0'>
                        <span className='text-sm font-medium mr-1'>
                          View launches
                        </span>
                        <ArrowRight className='h-4 w-4' />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

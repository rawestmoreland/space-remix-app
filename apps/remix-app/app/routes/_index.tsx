import { json, useLoaderData, type MetaFunction } from '@remix-run/react';
import { AxiosError, isAxiosError } from 'axios';
import { useMemo } from 'react';
import { getAstronauts } from '~/services/astronautService';
import LandingPage, {
  baikonur,
  brownsville,
  guiana,
  kennedy,
} from '~/components/landing-page';
import {
  getLaunches,
  getNextLaunchByLocation,
  ILaunchResponse,
} from '~/services/launchService';
import { getLocation, ILocationResult } from '~/services/locationService';

export const meta: MetaFunction = () => {
  return [
    { title: 'Launch List' },
    {
      name: 'description',
      content:
        'Welcome to the most comprehensive space launch site in the world!',
    },
    {
      property: 'og:image',
      content: 'https://launchlist.space/placeholder-rocket.jpg',
    },
  ];
};

export const loader = async () => {
  try {
    const today = new Date();
    const currentDay = today.getDay(); // 0 is Sunday, 1 is Monday, etc.

    // Calculate days until next Sunday (0 if today is Sunday)
    const daysUntilSunday = currentDay === 0 ? 0 : 7 - currentDay;
    // Calculate days since last Sunday
    const daysSinceLastSunday = currentDay;

    const nextSunday = new Date(today);
    const lastSunday = new Date(today);
    lastSunday.setDate(today.getDate() - daysSinceLastSunday);
    nextSunday.setDate(today.getDate() + daysUntilSunday);
    const nextSundayString = nextSunday.toISOString();
    const lastSundayString = lastSunday.toISOString();

    const [
      launchesThisWeekResponse,
      launchesResponse,
      astronautsResponse,
      nextGuianaLaunch,
      nextKennedyLaunch,
      nextBaikonurLaunch,
      nextBrownsvilleLaunch,
      guianaLocationData,
      kennedyLocationData,
      baikonurLocationData,
      brownsvilleLocationData,
    ] = await Promise.all([
      getLaunches(
        `${process.env.LL_BASE_URL}/launches?net__gte=${lastSundayString}&net__lte=${nextSundayString}`
      ),
      getLaunches(`${process.env.LL_BASE_URL}/launches?ordering=net`),
      getAstronauts(
        `${process.env.LL_BASE_URL}/astronauts?in_space=true&is_human=true`
      ),
      getNextLaunchByLocation(guiana),
      getNextLaunchByLocation(kennedy),
      getNextLaunchByLocation(baikonur),
      getNextLaunchByLocation(brownsville),
      getLocation(guiana),
      getLocation(kennedy),
      getLocation(baikonur),
      getLocation(brownsville),
    ]);

    const responseData = {
      launchesThisWeek: launchesThisWeekResponse.error
        ? 0
        : (launchesThisWeekResponse.data?.count ?? 0),
      launches: launchesResponse.error
        ? 0
        : (launchesResponse.data?.count ?? 0),
      astronauts: astronautsResponse.error
        ? []
        : (astronautsResponse.data?.results ?? []),
      nextGuianaLaunch: nextGuianaLaunch.error
        ? ({} as ILaunchResponse)
        : (nextGuianaLaunch.data as ILaunchResponse),
      nextKennedyLaunch: nextKennedyLaunch.error
        ? ({} as ILaunchResponse)
        : (nextKennedyLaunch.data as ILaunchResponse),
      nextBaikonurLaunch: nextBaikonurLaunch.error
        ? ({} as ILaunchResponse)
        : (nextBaikonurLaunch.data as ILaunchResponse),
      nextBrownsvilleLaunch: nextBrownsvilleLaunch.error
        ? ({} as ILaunchResponse)
        : (nextBrownsvilleLaunch.data as ILaunchResponse),
      guianaLocationData: guianaLocationData.error
        ? ({} as ILocationResult)
        : (guianaLocationData.data as ILocationResult),
      kennedyLocationData: kennedyLocationData.error
        ? ({} as ILocationResult)
        : (kennedyLocationData.data as ILocationResult),
      baikonurLocationData: baikonurLocationData.error
        ? ({} as ILocationResult)
        : (baikonurLocationData.data as ILocationResult),
      brownsvilleLocationData: brownsvilleLocationData.error
        ? ({} as ILocationResult)
        : (brownsvilleLocationData.data as ILocationResult),
      error: null,
    };

    return json(responseData);
  } catch (error) {
    console.error(error);
    if (isAxiosError(error)) {
      const axiosError = error as AxiosError;
      return json({
        launchesThisWeek: null,
        launches: null,
        astronauts: null,
        nextGuianaLaunch: null,
        nextKennedyLaunch: null,
        nextBaikonurLaunch: null,
        nextBrownsvilleLaunch: null,
        guianaLocationData: null,
        kennedyLocationData: null,
        baikonurLocationData: null,
        brownsvilleLocationData: null,
        error:
          axiosError.response?.data ||
          axiosError.message ||
          'An error occurred',
      });
    }
    return json({
      launchesThisWeek: null,
      launches: null,
      astronauts: null,
      nextGuianaLaunch: null,
      nextKennedyLaunch: null,
      nextBaikonurLaunch: null,
      nextBrownsvilleLaunch: null,
      guianaLocationData: null,
      kennedyLocationData: null,
      baikonurLocationData: null,
      brownsvilleLocationData: null,
      error: 'An error occurred',
    });
  }
};

export default function Index() {
  const {
    astronauts,
    launches,
    launchesThisWeek,
    nextGuianaLaunch,
    nextKennedyLaunch,
    nextBaikonurLaunch,
    nextBrownsvilleLaunch,
    guianaLocationData,
    kennedyLocationData,
    baikonurLocationData,
    brownsvilleLocationData,
  } = useLoaderData<typeof loader>();

  const nextLaunches = useMemo(() => {
    return {
      guiana: nextGuianaLaunch || ({} as ILaunchResponse),
      kennedy: nextKennedyLaunch || ({} as ILaunchResponse),
      baikonur: nextBaikonurLaunch || ({} as ILaunchResponse),
      brownsville: nextBrownsvilleLaunch || ({} as ILaunchResponse),
    };
  }, [
    nextGuianaLaunch,
    nextKennedyLaunch,
    nextBaikonurLaunch,
    nextBrownsvilleLaunch,
  ]);

  const locationData = useMemo(() => {
    return {
      guiana: guianaLocationData || ({} as ILocationResult),
      kennedy: kennedyLocationData || ({} as ILocationResult),
      baikonur: baikonurLocationData || ({} as ILocationResult),
      brownsville: brownsvilleLocationData || ({} as ILocationResult),
    };
  }, [
    guianaLocationData,
    kennedyLocationData,
    baikonurLocationData,
    brownsvilleLocationData,
  ]);

  return (
    <LandingPage
      astronauts={astronauts ?? []}
      totalLaunches={launches ?? 0}
      launchesThisWeek={launchesThisWeek ?? 0}
      nextLaunches={nextLaunches}
      locationData={locationData}
    />
  );
}

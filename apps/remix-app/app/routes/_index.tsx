import { json, useLoaderData, type MetaFunction } from '@remix-run/react';
import { AxiosError, isAxiosError } from 'axios';
import LandingPage from '~/components/landing-page';
import { getAstronauts } from '~/services/astronautService';
import { getLaunches } from '~/services/launchService';

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
    const todayString = today.toISOString();

    const currentDay = today.getDay(); // 0 is Sunday, 1 is Monday, etc.
    const daysUntilSunday = currentDay === 0 ? 7 : 7 - currentDay;

    const nextSunday = new Date(today);
    nextSunday.setDate(today.getDate() + daysUntilSunday);
    const nextSundayString = nextSunday.toISOString();

    const [launchesThisWeekResponse, launchesResponse, astronautsResponse] =
      await Promise.all([
        getLaunches(
          `${process.env.LL_BASE_URL}/launches/upcoming?net__gte=${todayString}&net__lte=${nextSundayString}`
        ),
        getLaunches(`${process.env.LL_BASE_URL}/launches?ordering=net`),
        getAstronauts(
          `${process.env.LL_BASE_URL}/astronauts?in_space=true&is_human=true`
        ),
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
      error: 'An error occurred',
    });
  }
};

export default function Index() {
  const { astronauts, launches, launchesThisWeek } =
    useLoaderData<typeof loader>();

  return (
    <LandingPage
      astronauts={astronauts ?? []}
      totalLaunches={launches ?? 0}
      launchesThisWeek={launchesThisWeek ?? 0}
    />
  );
}

import { ActionFunctionArgs } from '@remix-run/node';
import {
  json,
  useFetcher,
  useLoaderData,
  type MetaFunction,
} from '@remix-run/react';
import axios, { AxiosError, isAxiosError } from 'axios';
import {
  CalendarIcon,
  ChevronRightIcon,
  MailIcon,
  NewspaperIcon,
  RocketIcon,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FormSuccessDialog } from '~/components/form-success-dialog';
import { SpaceStat } from '~/components/space-stat';
import { AnimatedSubscribeButton } from '~/components/ui/animated-subscribe-button';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import Marquee from '~/components/ui/marquee';
import { cn } from '~/lib/utils';
import { getAstronauts } from '~/services/astronautService';
import { getLaunches, ILaunchResult } from '~/services/launchService';
import { IArticle } from '~/services/newsService';
import { createContact } from '~/services/sendfoxService';

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
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const [
      articlesResponse,
      launchesResponse,
      launchesThisWeekResponse,
      astronautsResponse,
      issResponse,
    ] = await Promise.all([
      axios.get(
        `https://api.spaceflightnewsapi.net/v4/articles?limit=7&ordering=published_at`
      ),
      getLaunches(
        `${process.env.LL_BASE_URL}/launches/upcoming?limit=7&ordering=net`
      ),
      getLaunches(
        `${process.env.LL_BASE_URL}/launches/upcoming?net_gte=${today.toISOString()}&net_lte=${nextWeek.toISOString()}`
      ),
      getAstronauts(
        `${process.env.LL_BASE_URL}/astronauts?in_space=true&is_human=true`
      ),
      fetch('http://localhost:5173/api/iss-location').then((res) => res.json()),
    ]);

    return json({
      articles: articlesResponse.data.results,
      launches: launchesResponse.error ? null : launchesResponse.data?.results,
      launchesThisWeek: launchesThisWeekResponse.error
        ? null
        : launchesThisWeekResponse.data?.results.length,
      astronauts: astronautsResponse.error
        ? null
        : astronautsResponse.data?.results,
      issSpeed: issResponse.error ? null : '7.66 km/s',
      issLocation: issResponse.error ? null : issResponse.data.iss_position,
      error: null,
    });
  } catch (error) {
    console.error(error);
    if (isAxiosError(error)) {
      const axiosError = error as AxiosError;
      return json({
        articles: null,
        launches: null,
        astronauts: null,
        issSpeed: null,
        issLocation: null,
        launchesThisWeek: null,
        error:
          axiosError.response?.data ||
          axiosError.message ||
          'An error occurred',
      });
    }
    return json({
      articles: null,
      launches: null,
      astronauts: null,
      launchesThisWeek: null,
      issSpeed: null,
      issLocation: null,
      error: 'An error occurred',
    });
  }
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const email = formData.get('email') as string;
  const { data, error } = await createContact(email);
  if (error) {
    return json({ ok: false, data: null });
  }
  return json({ data, ok: true });
};

export default function Index() {
  const {
    articles,
    launches,
    astronauts,
    launchesThisWeek,
    issLocation: initialIssLocation,
  } = useLoaderData<typeof loader>();
  const formRef = useRef<HTMLFormElement>(null);
  const fetcher = useFetcher<typeof action>();
  const [displayFormSuccess, setDisplayFormSuccess] = useState(false);

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data?.ok === true) {
      setDisplayFormSuccess(true);
    } else if (fetcher.state === 'idle' && !fetcher.data?.ok === false) {
      alert('An error occurred. Please try again later.');
    }
  }, [fetcher.state, fetcher.data]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetcher.load('/api/iss-location');
    }, 10000);
    return () => clearInterval(interval);
  }, [fetcher]);

  // Memoize the ISS location data
  const issLocation = useMemo(() => {
    const currentLocation =
      fetcher.data?.data?.iss_position ?? initialIssLocation;
    if (!currentLocation) return 'Unknown';

    return `${currentLocation.latitude}, ${currentLocation.longitude}`;
  }, [fetcher.data, initialIssLocation]);

  return (
    <main className='flex-1'>
      <section className='w-full py-12'>
        <div className='container mx-auto max-w-6xl px-4 md:px-6'>
          <div className='overflow-hidden flex flex-col items-center space-y-4 text-center'>
            <div className='space-y-2'>
              <h1 className='text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none'>
                Your Weekly Dose of Space Exploration
              </h1>
              <p className='mx-auto max-w-[700px] text-muted-foreground md:text-xl'>
                Stay informed about upcoming rocket launches, space missions,
                and industry news with our curated weekly newsletter.
              </p>
            </div>
            <div className='w-full max-w-sm space-y-2'>
              <fetcher.Form
                ref={formRef}
                method='post'
                className='flex flex-col gap-2 md:flex-row'
              >
                <Input
                  name='email'
                  required
                  className='flex-1'
                  placeholder='Enter your email'
                  type='email'
                />
                <AnimatedSubscribeButton
                  type='submit'
                  buttonColor={`rgb(220, 90, 50)`}
                  buttonTextColor='white'
                  subscribeStatus={
                    fetcher.state === 'idle' && fetcher.data?.ok === true
                  }
                  initialText={
                    <span className='text-sm group inline-flex items-center'>
                      Subscribe{' '}
                      <ChevronRightIcon className='ml-1 size-4 transition-transform duration-300 group-hover:translate-x-1' />
                    </span>
                  }
                  changeText={
                    <span className='text-sm group inline-flex items-center'>
                      <RocketIcon className='mr-1 size-4' />
                      Subscribed!
                    </span>
                  }
                />
              </fetcher.Form>
              <p className='text-xs text-muted-foreground'>
                Join our growing list of space enthusiasts. Unsubscribe at any
                time.
              </p>
            </div>
          </div>
          {!!articles?.length && (
            <Marquee pauseOnHover className='[--duration:40s] mt-8'>
              {articles.map((article: IArticle) => (
                <ArticleCard
                  key={article.id}
                  url={article.url}
                  img={article?.image_url ?? '/placeholder-rocket.jpg'}
                  title={article.title}
                  summary={article.summary}
                  outlet={article.news_site}
                />
              ))}
            </Marquee>
          )}
          {!!launches?.length && (
            <Marquee reverse pauseOnHover className='[--duration:40s]'>
              {launches.map((launch: ILaunchResult) => (
                <ArticleCard
                  key={launch.id}
                  url='#'
                  img={launch?.image?.image_url ?? '/placeholder-rocket.jpg'}
                  title={launch.mission?.name ?? 'Unknown'}
                  summary={launch.mission?.description ?? 'No description'}
                  outlet={launch.program?.[0]?.name ?? 'Unknown agency'}
                />
              ))}
            </Marquee>
          )}
        </div>
      </section>

      <section className='w-full py-12 bg-gradient-to-b from-slate-50 to-slate-100'>
        <div className='container mx-auto max-w-6xl px-4 md:px-6'>
          <div className='flex flex-col items-center justify-center space-y-8 text-center'>
            <div className='space-y-2'>
              <h2 className='text-3xl font-bold tracking-tighter md:text-4xl bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent'>
                Current Space Stats
              </h2>
              <div className='h-1 w-20 mx-auto bg-gradient-to-r from-primary to-primary/70 rounded-full'></div>
            </div>
            <div className='grid gap-6 lg:grid-cols-3 w-full'>
              <SpaceStat
                to='/astronauts/in-space'
                title='Astronauts in Space'
                value={astronauts?.length ?? 'Unknown'}
                className='transform transition-all duration-300 hover:scale-105 hover:shadow-lg backdrop-blur-sm rounded-xl border border-slate-200'
              />
              <SpaceStat
                to='/launches/upcoming'
                title='Launches this Week'
                value={launchesThisWeek?.toString() ?? 'Unknown'}
                className='transform transition-all duration-300 hover:scale-105 hover:shadow-lg backdrop-blur-sm rounded-xl border border-slate-200'
              />
              <SpaceStat
                title='ISS Location'
                value={issLocation}
                className='transform transition-all duration-300 hover:scale-105 hover:shadow-lg backdrop-blur-sm rounded-xl border border-slate-200'
              />
            </div>
          </div>
        </div>
      </section>

      <section className='w-full py-12'>
        <div className='container mx-auto max-w-6xl px-4 md:px-6'>
          <div className='grid gap-10 sm:grid-cols-2 lg:grid-cols-3'>
            <div className='flex flex-col items-center space-y-4 text-center'>
              <div className='rounded-full bg-primary p-3'>
                <MailIcon className='h-6 w-6' />
              </div>
              <h2 className='text-xl text-primary font-bold'>Weekly Digest</h2>
              <p className='text-white'>
                Receive a comprehensive summary of the week&apos;s most
                important space events and launches.
              </p>
            </div>
            <div className='flex flex-col items-center space-y-4 text-center'>
              <div className='rounded-full bg-primary p-3'>
                <CalendarIcon className='h-6 w-6' />
              </div>
              <h2 className='text-xl text-primary font-bold'>
                Launch Calendar
              </h2>
              <p className='text-white'>
                Get an up-to-date schedule of upcoming rocket launches from
                around the world.
              </p>
            </div>
            <div className='flex flex-col items-center space-y-4 text-center'>
              <div className='rounded-full bg-primary p-3'>
                <NewspaperIcon className='h-6 w-6' />
              </div>
              <h2 className='text-xl text-primary font-bold'>
                Industry Insights
              </h2>
              <p className='text-white'>
                Dive into expert analysis and breaking news from the space
                industry.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* <section className='w-full bg-slate-50 py-12'>
        <div className='container mx-auto max-w-6xl px-4 md:px-6'>
          <div className='flex flex-col items-center justify-center space-y-4 text-center'>
            <div className='space-y-2'>
              <h2 className='text-3xl font-bold tracking-tighter md:text-4xl'>
                What Our Readers Say
              </h2>
              <p className='mx-auto max-w-[600px] text-gray-500 dark:text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed'>
                Join thousands of space enthusiasts who trust Launch List for
                their weekly space updates.
              </p>
            </div>
            <div className='grid gap-6 lg:grid-cols-3'>
              {testimonials.map((testimonial: ITestimonial) => (
                <Testimonial
                  key={`testimonial-${testimonial.order}`}
                  quote={testimonial.quote}
                  author={testimonial.author}
                />
              ))}
            </div>
          </div>
        </div>
      </section> */}

      <section className='w-full py-12 md:py-24 lg:py-32 bg-slate-50'>
        <div className='container mx-auto max-w-6xl px-4 md:px-6'>
          <div className='flex flex-col items-center justify-center space-y-4 text-center'>
            <div className='space-y-2'>
              <h2 className='text-3xl font-bold text-primary tracking-tighter md:text-4xl'>
                Ready for Liftoff?
              </h2>
              <p className='mx-auto max-w-[600px] text-muted md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed'>
                Subscribe now and never miss an important space event again.
                Your journey through the cosmos starts here.
              </p>
            </div>
            <div className='w-full max-w-sm space-y-2'>
              <fetcher.Form
                method='post'
                ref={formRef}
                className='flex flex-col gap-2 sm:flex-row'
              >
                <Input
                  name='email'
                  required
                  className='flex-1'
                  placeholder='Enter your email'
                  type='email'
                />
                <Button type='submit'>
                  Join Now
                  <RocketIcon className='ml-2 h-4 w-4' />
                </Button>
              </fetcher.Form>
            </div>
          </div>
        </div>
      </section>

      <FormSuccessDialog
        isOpen={displayFormSuccess}
        onClose={() => {
          formRef.current?.reset();
          setDisplayFormSuccess(false);
        }}
      />
    </main>
  );
}

const ArticleCard = ({
  img,
  title,
  outlet,
  summary,
  url,
}: {
  img: string;
  title: string;
  outlet: string;
  summary: string;
  url: string;
}) => {
  if (url === '#') {
    return (
      <figure
        className={cn(
          'relative w-64 cursor-pointer overflow-hidden rounded-xl border p-4',
          // light styles
          'border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]',
          // dark styles
          'dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]'
        )}
      >
        <div className='flex flex-row items-center gap-2'>
          <img className='rounded-full w-8 h-8' alt='' src={img} />
          <div className='flex flex-col'>
            <figcaption className='text-sm font-medium dark:text-white'>
              {title}
            </figcaption>
            <p className='text-xs font-medium dark:text-white/40'>{outlet}</p>
          </div>
        </div>
        <blockquote className='mt-2 text-sm line-clamp-3'>{summary}</blockquote>
      </figure>
    );
  }

  return (
    <a
      href={url}
      target='_blank'
      rel='noopener noreferrer'
      className={cn(
        'relative w-64 cursor-pointer overflow-hidden rounded-xl border p-4',
        // light styles
        'border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]',
        // dark styles
        'dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]'
      )}
    >
      <div className='flex flex-row items-center gap-2'>
        <img className='rounded-full w-8 h-8' alt='' src={img} />
        <div className='flex flex-col'>
          <figcaption className='text-sm font-medium dark:text-white'>
            {title}
          </figcaption>
          <p className='text-xs font-medium dark:text-white/40'>{outlet}</p>
        </div>
      </div>
      <blockquote className='mt-2 text-sm line-clamp-3'>{summary}</blockquote>
    </a>
  );
};

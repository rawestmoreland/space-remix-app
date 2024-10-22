import {
  isRouteErrorResponse,
  json,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRouteError,
} from '@remix-run/react';

import './tailwind.css';
import { Header } from './components/header';
import { Footer } from './components/footer';
import LoadingMask from './components/loading-mask';
import { LinksFunction } from '@remix-run/react/dist/routeModules';
import Particles from './components/ui/particles';
import HyperText from './components/ui/hyper-text';
import NumberTicker from './components/ui/number-ticker';
import axios from 'axios';

export const links: LinksFunction = () => [
  {
    rel: 'alternate',
    href: 'https://launchlist.space/rss.xml',
    type: 'application/rss+xml',
    title: 'RSS Feed',
  },
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700&display=swap',
  },
];

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      return (
        <div className='relative w-full flex flex-col items-center justify-center min-h-screen -mt-16'>
          <NumberTicker className='text-3xl font-bold mb-2' value={404} />
          <img
            className='z-10 w-[200px] h-[200px] object-cover rounded-full md:h-[500px] md:w-[500px] max-w-xl'
            src='/not-found.jpg'
            alt='Page not found'
          />
          <HyperText
            className='text-2xl font-bold w-full flex flex-wrap'
            text='OOPS!'
          />
          <HyperText
            className='text-2xl font-bold'
            text='THIS PAGE IS LOST IN SPACE'
          />
          <Particles
            className='absolute inset-0'
            quantity={500}
            ease={80}
            color='#000000'
            refresh
          />
        </div>
      );
    }
    return (
      <div className='relative w-full flex flex-col items-center justify-center min-h-screen -mt-16'>
        <NumberTicker className='text-3xl font-bold mb-2' value={500} />
        <img
          className='z-10 w-[200px] h-[200px] object-cover rounded-full md:h-[500px] md:w-[500px] max-w-xl'
          src='/error.jpg'
          alt='Page not found'
        />
        <HyperText
          className='text-2xl font-bold w-full flex flex-wrap'
          text='OOPS!'
        />
        <HyperText
          className='text-2xl font-bold'
          text='SOMETHING HAS GONE WRONG'
        />
        <Particles
          className='absolute inset-0'
          quantity={500}
          ease={80}
          color='#000000'
          refresh
        />
      </div>
    );
  } else if (error instanceof Error) {
    return (
      <div className='relative w-full flex flex-col items-center justify-center min-h-screen -mt-16'>
        <NumberTicker className='text-3xl font-bold mb-2' value={500} />
        <img
          className='z-10 w-[200px] h-[200px] object-cover rounded-full md:h-[500px] md:w-[500px] max-w-xl'
          src='/error.jpg'
          alt='Page not found'
        />
        <HyperText
          className='text-2xl font-bold w-full flex flex-wrap'
          text='OOPS!'
        />
        <HyperText
          className='text-2xl font-bold'
          text='SOMETHING HAS GONE WRONG'
        />
        <Particles
          className='absolute inset-0'
          quantity={500}
          ease={80}
          color='#000000'
          refresh
        />
      </div>
    );
  } else {
    return (
      <div className='relative w-full flex flex-col items-center justify-center min-h-screen -mt-16'>
        <NumberTicker className='text-3xl font-bold mb-2' value={500} />
        <img
          className='z-10 w-[200px] h-[200px] object-cover rounded-full md:h-[500px] md:w-[500px] max-w-xl'
          src='/error.jpg'
          alt='Page not found'
        />
        <HyperText
          className='text-2xl font-bold w-full flex flex-wrap'
          text='OOPS!'
        />
        <HyperText
          className='text-2xl font-bold'
          text='SOMETHING HAS GONE WRONG'
        />
        <Particles
          className='absolute inset-0'
          quantity={500}
          ease={80}
          color='#000000'
          refresh
        />
      </div>
    );
  }
}

export const loader = async () => {
  const response = await axios.get(`${process.env.LL_BASE_URL}/api-throttle`);

  return json({ throttle: response.data });
};

export function Layout({ children }: { children: React.ReactNode }) {
  const { throttle } = useLoaderData<typeof loader>();

  console.log(throttle);

  return (
    <html lang='en'>
      <head>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <Meta />
        <Links />
        <script
          async
          src='https://www.googletagmanager.com/gtag/js?id=G-NTNMMX927V'
        ></script>
        <script
          dangerouslySetInnerHTML={{
            __html: ` window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());

    gtag('config', 'G-NTNMMX927V');`,
          }}
        />
      </head>
      <body>
        <div className='flex min-h-screen flex-col'>
          <Header throttled={Boolean(throttle?.next_use_secs > 0)} />
          <LoadingMask />
          {children}
          <Footer />
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

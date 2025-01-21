import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
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
import {
  PreventFlashOnWrongTheme,
  Theme,
  ThemeProvider,
  useTheme,
} from 'remix-themes';

import clsx from 'clsx';
import { useEffect, useState } from 'react';

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

function ErrorContent() {
  const error = useRouteError();
  const [theme] = useTheme();

  const ErrorDisplay = () => {
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
              color='#FFFFFF'
              refresh
            />
          </div>
        );
      }
    }
    // Default error display for all other error types
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
  };

  return (
    <html lang='en' className={clsx(theme)}>
      <head>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <Meta />
        <PreventFlashOnWrongTheme ssrTheme={true} />
        <Links />
      </head>
      <body>
        <div className='flex min-h-screen flex-col'>
          <Header />
          <LoadingMask />
          <ErrorDisplay />
          <Footer />
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

function AppContent() {
  const [theme] = useTheme();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <html lang='en' className={clsx(theme)}>
      <head>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <Meta />
        <PreventFlashOnWrongTheme ssrTheme={true} />
        <Links />
        <script
          async
          src='https://www.googletagmanager.com/gtag/js?id=G-NTNMMX927V'
        ></script>
        {isClient && (
          <script
            async
            src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3399938065938082'
            crossOrigin='anonymous'
          ></script>
        )}
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
          <Header />
          <LoadingMask />
          <Outlet />
          <Footer />
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  return (
    <ThemeProvider specifiedTheme={Theme.DARK} themeAction='/action/set-theme'>
      <ErrorContent />
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider specifiedTheme={Theme.DARK} themeAction='/action/set-theme'>
      <AppContent />
    </ThemeProvider>
  );
}

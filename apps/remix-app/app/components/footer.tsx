import { RssIcon } from 'lucide-react';

export function Footer() {
  return (
    <footer className='flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t'>
      <p className='text-xs text-gray-500 dark:text-gray-400'>
        © 2024 Westmoreland Creative LLC. All rights reserved.
      </p>
      <nav className='sm:ml-auto flex gap-4 sm:gap-6'>
        <a target='_blank' rel='noreferrer' href='/rss.xml'>
          <RssIcon className='h-4 w-4' />
        </a>
        {/* <Link className='text-xs hover:underline underline-offset-4' to='#'>
          Terms of Service
        </Link>
        <Link className='text-xs hover:underline underline-offset-4' to='#'>
          Privacy Policy
        </Link>
        <Link className='text-xs hover:underline underline-offset-4' to='#'>
          Unsubscribe
        </Link> */}
        <a href='https://www.westmorelandcreative.com'>
          <p className='text-xs hover:underline underline-offset-4'>
            Westmoreland Creative
          </p>
        </a>
        <a href='mailto:richard@westmorelandcreative.com'>
          <p className='text-xs hover:underline underline-offset-4'>Contact</p>
        </a>
      </nav>
    </footer>
  );
}

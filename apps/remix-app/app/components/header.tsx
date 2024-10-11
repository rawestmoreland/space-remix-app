import { Link } from '@remix-run/react';
import { MenuIcon, RocketIcon } from 'lucide-react';
import { NavMenu } from './nav-menu';
import { Sheet, SheetContent } from './ui/sheet';
import { Button } from './ui/button';

import { navLinks, flattenedNavLinks } from '~/lib/constants';
import { useState } from 'react';

export function Header() {
  const mobileLinks = flattenedNavLinks(navLinks);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className='sticky z-10 top-0 flex h-16 justify-between md:justify-start items-center gap-4 border-b bg-background px-4 md:px-6'>
      <Button
        onClick={() => setMobileMenuOpen(true)}
        variant='outline'
        size='icon'
        className='shrink-0 md:hidden'
      >
        <MenuIcon className='h-5 w-5' />
        <span className='sr-only'>Toggle navigation menu</span>
      </Button>
      <Link className='flex items-center justify-center md:hidden' to='/'>
        <RocketIcon className='h-6 w-6 text-primary' />
        <span className='ml-2 text-lg font-bold'>Launch List</span>
      </Link>
      <nav className='hidden flex-col gap-6 text-lg md:justify-between md:w-full font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6'>
        <Link className='flex items-center justify-center' to='/'>
          <RocketIcon className='h-6 w-6 text-primary' />
          <span className='ml-2 text-lg font-bold'>Launch List</span>
        </Link>
        <NavMenu />
      </nav>
      <Sheet
        open={mobileMenuOpen}
        onOpenChange={() => setMobileMenuOpen(false)}
      >
        <SheetContent side='left'>
          <nav className='grid gap-6 text-lg font-medium'>
            {mobileLinks.map((link) => {
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>
      {/* <NavMenu /> */}
    </header>
  );
}

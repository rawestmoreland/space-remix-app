import { INavLink, navLinks } from '~/lib/constants';
import { Link, NavLink } from '@remix-run/react';
import { useCallback, useEffect, useRef, useState } from 'react';

export function NavMenu() {
  return (
    <nav aria-label='Main'>
      <ul className='flex gap-3 items-center'>
        {navLinks.map((link: INavLink) =>
          !link.content?.length ? (
            <li key={link.href} className='text-sm'>
              <NavLink
                className={({ isActive }) =>
                  `underline-offset-4 hover:underline ${
                    isActive ? 'font-medium text-primary underline' : ''
                  }`
                }
                to={link.href}
              >
                {link.label}
              </NavLink>
            </li>
          ) : (
            <DropdownMenuItem key={link.href} link={link} />
          )
        )}
      </ul>
    </nav>
  );
}

function DropdownMenuItem({ link }: { link: INavLink }) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const closeMenu = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 100); // Small delay to prevent menu from closing during hover transition
  }, []);

  const openMenu = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(true);
  }, []);

  // Handle escape key to close menu
  useEffect(() => {
    if (!isOpen) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  return (
    <li className='relative' onMouseEnter={openMenu} onMouseLeave={closeMenu}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' && !isOpen) {
            e.preventDefault();
            setIsOpen(true);
          }
        }}
        aria-expanded={isOpen}
        aria-haspopup='true'
        className='flex items-center gap-1 text-sm underline-offset-4 hover:underline'
      >
        <NavLink
          to={link.href}
          className={({ isActive }) =>
            `${isActive ? 'text-muted-foreground underline' : ''}`
          }
        >
          {link.label}
        </NavLink>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='16'
          height='16'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
          className={`transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        >
          <polyline points='6 9 12 15 18 9' />
        </svg>
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className='absolute left-0 top-full z-50 mt-2 min-w-[150px] max-w-[200px] rounded-md border bg-background shadow-md'
          role='menu'
          style={{
            // Prevent overflow by ensuring the menu stays within viewport
            right: 'auto',
            transform: 'translateX(calc(min(0px, calc(100vw - 100% - 1rem))))',
          }}
        >
          <ul className='flex flex-col p-2'>
            {link.content
              ?.sort((a, b) => a.order - b.order)
              .map((sublink) => (
                <li key={sublink.href} role='none' className='text-sm'>
                  <Link
                    to={sublink.href}
                    className='block w-full rounded-sm px-2 py-1.5 underline-offset-4 hover:bg-accent hover:underline truncate'
                    role='menuitem'
                    onClick={() => setIsOpen(false)}
                  >
                    {sublink.label}
                  </Link>
                </li>
              ))}
          </ul>
        </div>
      )}
    </li>
  );
}

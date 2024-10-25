import { INavLink, navLinks } from '~/lib/constants';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from './ui/navigation-menu';
import { Link, NavLink } from '@remix-run/react';

export function NavMenu({ throttled }: { throttled: boolean }) {
  return (
    <NavigationMenu>
      <NavigationMenuList className='flex gap-3'>
        {navLinks
          .filter((link: INavLink) =>
            throttled ? link.href === '/news' || link.href === '/' : true
          )
          .map((link: INavLink) =>
            !link.content?.length ? (
              <NavigationMenuItem
                key={link.href}
                className='text-sm underline-offset-4 hover:underline'
              >
                <NavLink
                  className={({ isActive }) =>
                    `${isActive ? 'font-medium text-primary underline' : ''}`
                  }
                  to={link.href}
                >
                  {link.label}
                </NavLink>
              </NavigationMenuItem>
            ) : (
              <NavigationMenuItem key={link.href}>
                <NavigationMenuTrigger>
                  <NavLink
                    to={link.href}
                    className={({ isActive }) =>
                      `${isActive ? 'text-muted-foreground underline' : ''}`
                    }
                  >
                    {link.label}
                  </NavLink>
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className='z-50 flex min-w-max flex-col gap-4 p-4'>
                    {link.content
                      .sort((a, b) => a.order - b.order)
                      .map((sublink) => (
                        <NavigationMenuLink key={sublink.href} asChild>
                          <li
                            key={sublink.href}
                            className='text-sm underline-offset-4 hover:underline'
                          >
                            <Link to={sublink.href}>{sublink.label}</Link>
                          </li>
                        </NavigationMenuLink>
                      ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            )
          )}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

import { useLocation } from '@remix-run/react';
import { HomeIcon } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbPage,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from '~/components/ui/breadcrumb';

type LaunchBreadcrumbsProps = {
  urlContext?: string;
  className?: string;
  launchName?: string;
};

export function LaunchBreadcrumbs({
  urlContext,
  launchName,
}: LaunchBreadcrumbsProps) {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  const generateBreadcrumbItems = () => {
    const items = [
      {
        href: '/',
        label: <HomeIcon className='h-4 w-4' />,
      },
    ];

    // If we're in the launches section
    if (pathSegments[0] === 'launches') {
      items.push({
        href: '/launches',
        label: <span>Launches</span>,
      });

      // Add specific section if we're in past or upcoming
      if (pathSegments[1] === 'past') {
        items.push({
          href: '/launches/past',
          label: <span>Past Launches</span>,
        });
      } else if (pathSegments[1] === 'upcoming') {
        items.push({
          href: '/launches/upcoming',
          label: <span>Upcoming Launches</span>,
        });
      }
    }
    // If we're on a specific launch page
    else if (pathSegments[0] === 'launch' && pathSegments[1]) {
      items.push({
        href: '/launches',
        label: <span>Launches</span>,
      });

      // Check the context from which we came
      if (urlContext) {
        if (urlContext.includes('/launches/upcoming/spacex')) {
          items.push({
            href: '/launches/upcoming/spacex',
            label: <span>Upcoming SpaceX Launches</span>,
          });
        } else if (urlContext.includes('/launches/upcoming/starship')) {
          items.push({
            href: '/launches/upcoming/starship',
            label: <span>Upcoming Starship Launches</span>,
          });
        } else if (urlContext.includes('/launches/past')) {
          items.push({
            href: '/launches/past',
            label: <span>Past Launches</span>,
          });
        } else if (urlContext.includes('/launches/upcoming')) {
          items.push({
            href: '/launches/upcoming',
            label: <span>Upcoming Launches</span>,
          });
        }
      }

      items.push({
        href: `/launch/${pathSegments[1]}`,
        label: <span>{`${launchName ? launchName : 'Launch'}`}</span>,
      });
    }

    return items;
  };

  const breadcrumbItems = generateBreadcrumbItems();

  return (
    <Breadcrumb>
      <BreadcrumbList className='flex items-center gap-2 mb-4'>
        {breadcrumbItems.map((item, index) => (
          <div className='flex items-center gap-2' key={item.href}>
            <BreadcrumbItem key={item.href}>
              {index === breadcrumbItems.length - 1 ? (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {index < breadcrumbItems.length - 1 && <BreadcrumbSeparator />}
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

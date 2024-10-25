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

type EventBreadcrumbsProps = {
  urlContext?: string;
  className?: string;
  eventName?: string;
};

export function EventsBreadcrumbs({
  urlContext,
  className,
  eventName,
}: EventBreadcrumbsProps) {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  const generateBreadcrumbItems = () => {
    const items = [
      {
        href: '/',
        label: <HomeIcon className='h-4 w-4' />,
      },
    ];

    // If we're in the events section
    if (pathSegments[0] === 'events') {
      items.push({
        href: '/events',
        label: <span>Events</span>,
      });

      // Add specific section if we're in past or upcoming
      if (pathSegments[1] === 'past') {
        items.push({
          href: '/events/past',
          label: <span>Past events</span>,
        });
      } else if (pathSegments[1] === 'upcoming') {
        items.push({
          href: '/events/upcoming',
          label: <span>Upcoming events</span>,
        });
      }
    }
    // If we're on a specific event page
    else if (pathSegments[0] === 'event' && pathSegments[1]) {
      items.push({
        href: '/events',
        label: <span>Events</span>,
      });

      // Check the context from which we came
      if (urlContext) {
        if (urlContext.includes('/events/upcoming/spacex')) {
          items.push({
            href: '/events/upcoming/spacex',
            label: <span>Upcoming SpaceX events</span>,
          });
        } else if (urlContext.includes('/events/upcoming/starship')) {
          items.push({
            href: '/events/upcoming/starship',
            label: <span>Upcoming Starship events</span>,
          });
        } else if (urlContext.includes('/events/past')) {
          items.push({
            href: '/events/past',
            label: <span>Past events</span>,
          });
        } else if (urlContext.includes('/events/upcoming')) {
          items.push({
            href: '/events/upcoming',
            label: <span>Upcoming events</span>,
          });
        }
      }

      items.push({
        href: `/event/${pathSegments[1]}`,
        label: <span>{`${eventName ? eventName : 'Event'}`}</span>,
      });
    }

    return items;
  };

  const breadcrumbItems = generateBreadcrumbItems();

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {breadcrumbItems.map((item, index) => (
          <BreadcrumbItem key={item.href}>
            {index === breadcrumbItems.length - 1 ? (
              <BreadcrumbPage>{item.label}</BreadcrumbPage>
            ) : (
              <>
                <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                <BreadcrumbSeparator />
              </>
            )}
          </BreadcrumbItem>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

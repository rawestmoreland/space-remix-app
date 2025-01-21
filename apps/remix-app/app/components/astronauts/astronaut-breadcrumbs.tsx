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

type AstronautBreadcrumbsProps = {
  className?: string;
  astronautName?: string;
};

export function AstronautBreadcrumbs({
  className,
  astronautName,
}: AstronautBreadcrumbsProps) {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  const generateBreadcrumbItems = () => {
    const items = [
      {
        href: '/',
        label: <HomeIcon className='h-4 w-4' />,
      },
    ];

    // If we're in the astronauts section
    if (pathSegments[0] === 'astronauts') {
      items.push({
        href: '/astronauts',
        label: <span>Astronauts</span>,
      });
    }
    // If we're on a specific astronaut page
    else if (pathSegments[0] === 'astronaut' && pathSegments[1]) {
      items.push({
        href: '/astronauts',
        label: <span>Astronauts</span>,
      });
    }

    items.push({
      href: `/astronaut/${pathSegments[1]}`,
      label: <span>{`${astronautName ? astronautName : 'Astronaut'}`}</span>,
    });

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

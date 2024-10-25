export interface INavLink {
  href: string;
  label: string;
  content?: { order: number; href: string; label: string }[];
}

export interface ITestimonial {
  order: number;
  author: string;
  quote: string;
}

export const navLinks = [
  { href: '/', label: 'Home' },
  {
    href: '/news',
    label: 'News',
    content: [
      { order: 1, href: '/news', label: 'All news' },
      { order: 2, href: '/news/spacex', label: 'SpaceX news' },
      { order: 3, href: '/news/summaries', label: 'Weekly Summaries' },
    ],
  },
  {
    href: '/launches',
    label: 'Launches',
    content: [
      { order: 1, href: '/launches/upcoming', label: 'Upcoming launches' },
      { order: 2, href: '/launches/past', label: 'Past launches' },
      { order: 3, href: '/launches/upcoming/spacex', label: 'SpaceX launches' },
      {
        order: 4,
        href: '/launches/upcoming/starship',
        label: 'Starship launches',
      },
      { order: 5, href: '/launches', label: 'All launches' },
    ],
  },
  { href: '/events', label: 'Events' },
  { href: '/astronauts', label: 'Astronauts' },
  { href: '/starship', label: 'Starship' },
  // { href: "/calendar", label: "Calendar" },
];

export const flattenedNavLinks = (links: INavLink[]) => {
  return links.reduce((acc: INavLink[], link: INavLink) => {
    if (link.content) {
      return [...acc, { href: link.href, label: link.label }, ...link.content];
    }
    return [...acc, link];
  }, []);
};

export const testimonials = [
  {
    order: 1,
    author: 'Sarah J., Aerospace Engineer',
    quote:
      "Launch List keeps me informed about all the exciting developments in space exploration. It's my go-to source for launch information!",
  },
  {
    order: 2,
    author: 'Mike T., Science Teacher',
    quote:
      "As a space enthusiast, I love how Launch List curates the most important news and upcoming events. It's a must-read every week!",
  },
  {
    order: 3,
    author: 'Emily R., Astrophotographer',
    quote:
      'The launch calendar feature is incredibly helpful for planning my astrophotography sessions. Launch List has become an essential tool for me.',
  },
];

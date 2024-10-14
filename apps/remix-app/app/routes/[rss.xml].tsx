import { LoaderFunction } from '@remix-run/node';

export type RssPost = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  guid?: string;
  author?: string;
  slug: string;
};

/**
 * Generates an RSS feed from a list of posts.
 * @param title Title of the RSS feed
 * @param description A description of the RSS feed
 * @param link Link to the main page for the RSS feed
 * @param posts List of posts to include in the feed
 */
export function generateRss({
  description,
  posts,
  link,
  title,
}: {
  title: string;
  description: string;
  link: string;
  posts: RssPost[];
}): string {
  const rssHeader = `<?xml version="1.0" encoding="UTF-8"?>
    <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
      <channel>
        <title>${title}</title>
        <description>${description}</description>
        <link>${link}</link>
        <language>en-us</language>
        <ttl>60</ttl>
        <atom:link href="https://launchlist.space/rss.xml" rel="self" type="application/rss+xml" />`;

  const rssBody = posts
    .map(
      (post) => `
          <item>
            <title><![CDATA[${post.title}]]></title>
            <description><![CDATA[${post.description}]]></description>
            <pubDate>${post.pubDate}</pubDate>
            <link>https://launchlist.space/post/${post.slug}</link>
            <guid isPermaLink="false">${post.link}</guid>
          </item>`
    )
    .join('');

  const rssFooter = `
      </channel>
    </rss>`;

  return rssHeader + rssBody + rssFooter;
}

export const loader: LoaderFunction = async () => {
  const posts = [
    {
      title: 'This week in space',
      slug: 'this-week-in-space',
      pubDate: '2024-10-7',
      description: 'This is a summary of the week in space.',
      excerpt: 'This is a summary of the week in space.',
      guid: 'https://launchlist.space/post/this-week-in-space',
      author: 'Richard W.',
    },
  ];
  const feed = generateRss({
    title: 'The Launch List Weekly Digest',
    description:
      'The latest posts from The Launch List. Weekly updates on space launches, astronauts, and more.',
    link: 'https://launchlist.space',
    posts: posts.map((post) => ({
      title: post.title,
      link: `https://launchlist.space/post/${post.slug}`,
      description: post.excerpt,
      pubDate: new Date(post.pubDate).toUTCString(),
      slug: post.slug,
    })),
  });

  return new Response(feed, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=2419200',
    },
  });
};

import { LoaderFunction } from '@remix-run/node';
import { prisma } from '~/db.server';

export type RssPost = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  guid?: string;
  author?: string;
  slug: string;
  content: string;
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
    <rss xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom" version="2.0">
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
            <title>${post.title}</title>
            <description>${post.description}</description>
            <pubDate>${post.pubDate}</pubDate>
            <link>https://launchlist.space/post/${post.slug}</link>
            <dc:creator>${post.author}</dc:creator>
            <content:encoded><![CDATA[${post.content}]]></content:encoded>
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
  const posts = await prisma.newsletterPost.findMany();

  const feed = generateRss({
    title: 'The Launch List Weekly Digest',
    description:
      'The latest posts from The Launch List. Weekly updates on space launches, astronauts, and more.',
    link: 'https://launchlist.space',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    posts: posts.map((post: RssPost) => ({
      title: post.title,
      link: `https://launchlist.space/post/${post.slug}`,
      description: post.description,
      pubDate: new Date(post.pubDate).toUTCString(),
      slug: post.slug,
      content: post.content,
      author: post.author,
    })),
  });

  return new Response(feed, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=2419200',
    },
  });
};

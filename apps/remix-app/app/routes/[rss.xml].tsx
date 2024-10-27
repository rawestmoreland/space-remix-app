import { NewsletterPost, NewsletterPostStatus } from '@prisma/client';
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

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    return c;
    switch (c) {
      case '&':
        return '&amp;';
      case "'":
        return '&apos;';
      case '"':
        return '&quot;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      default:
        return c;
    }
  });
}

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
        <title>${escapeXml(title)}</title>
        <description>${escapeXml(description)}</description>
        <link>${escapeXml(link)}</link>
        <language>en-us</language>
        <ttl>60</ttl>
        <atom:link href="https://launchlist.space/rss.xml" rel="self" type="application/xml" />
        <lastBuildDate>${new Date(posts.sort((a: { pubDate: string }, b: { pubDate: string }) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())[0].pubDate).toUTCString().replace('GMT', '+0000')}</lastBuildDate>
        <atom:updated>${new Date(posts.sort((a: { pubDate: string }, b: { pubDate: string }) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())[0].pubDate).toISOString()}</atom:updated>
        <atom:published>${new Date(posts.sort((a: { pubDate: string }, b: { pubDate: string }) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())[0].pubDate).toISOString()}</atom:published>`;

  const rssBody = posts
    .sort(
      (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
    )
    .map(
      (post) => `
          <item>
            <title>${escapeXml(post.title)}</title>
            <description>${escapeXml(post.description)}</description>
            <pubDate>${escapeXml(post.pubDate)}</pubDate>
            <atom:published>${new Date(post.pubDate).toISOString()}</atom:published>
            <link>https://launchlist.space/post/${escapeXml(post.slug)}</link>
            <dc:creator>${escapeXml(post.author ?? 'Richard W.')}</dc:creator>
            <content:encoded><![CDATA[${post.content}]]></content:encoded>
            <guid isPermaLink="false">${escapeXml(post.link)}</guid>
          </item>`
    )
    .join('\n');

  const rssFooter = `
      </channel>
    </rss>`;

  return rssHeader + rssBody + rssFooter;
}

export const loader: LoaderFunction = async () => {
  const posts = await prisma.newsletterPost.findMany({
    where: {
      status: NewsletterPostStatus.PUBLISHED,
    },
  });

  const feed = generateRss({
    title: 'The Launch List Weekly Digest',
    description:
      'The latest posts from The Launch List. Weekly updates on space launches, astronauts, and more.',
    link: 'https://launchlist.space',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    posts: posts.map((post: NewsletterPost) => ({
      title: post.title,
      link: `https://launchlist.space/post/${post.slug}`,
      description: post.description ?? '',
      pubDate: post.pubDate
        ? new Date(post.pubDate).toUTCString()
        : new Date().toUTCString(),
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

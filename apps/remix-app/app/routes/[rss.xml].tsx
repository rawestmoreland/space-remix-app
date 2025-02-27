import { NewsletterPost, NewsletterPostStatus } from '@prisma/client';
import { LoaderFunction } from '@remix-run/node';
import { prisma } from '~/db.server';

export type RssPost = {
  id: string;
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

function encodeHtmlEntities(content: string): string {
  return content.replace(/&(?!(?:amp|lt|gt|quot|apos);)/g, '&amp;');
}

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
  const now = new Date();
  const utcString = now.toUTCString().replace('GMT', '+0000');
  const isoString = now.toISOString();

  const rssHeader = `<?xml version="1.0" encoding="UTF-8"?>
    <rss xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom" version="2.0">
      <channel>
        <title>${escapeXml(title)}</title>
        <description>${escapeXml(description)}</description>
        <link>${escapeXml(link)}</link>
        <language>en-us</language>
        <ttl>60</ttl>
        <atom:link href="https://launchlist.space/rss.xml" rel="self" type="application/rss+xml"/>
        <generator>LaunchList RSS Feed</generator>
        <docs>https://www.rssboard.org/rss-specification</docs>
        <lastBuildDate>${utcString}</lastBuildDate>
        <pubDate>${utcString}</pubDate>
        <atom:updated>${isoString}</atom:updated>
        <category>Space</category>
        <category>Astronomy</category>
        <category>Science</category>`;

  const rssBody = posts
    .sort(
      (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
    )
    .map((post) => {
      const postDate = new Date(post.pubDate);
      return `
  <item>
    <title>${escapeXml(post.title)}</title>
    <description>${escapeXml(post.description)}</description>
    <pubDate>${postDate.toUTCString().replace('GMT', '+0000')}</pubDate>
    <link>https://launchlist.space/summary/${escapeXml(post.slug)}</link>
    <dc:creator>${escapeXml(post.author ?? 'Richard W.')}</dc:creator>
    <content:encoded><![CDATA[${encodeHtmlEntities(post.content)}]]></content:encoded>
    <guid isPermaLink="false">${post.id}</guid>
    <category>Space</category>
    <source url="https://launchlist.space">The Launch List</source>
    <comments>https://launchlist.space/summary/${escapeXml(post.slug)}#comments</comments>
  </item>`;
    })
    .join('\n');

  const rssFooter = `
      </channel>
    </rss>`;

  return rssHeader + rssBody + rssFooter;
}

export const loader: LoaderFunction = async ({ request }) => {
  const posts = await prisma.newsletterPost.findMany({
    where: {
      status: NewsletterPostStatus.PUBLISHED,
    },
    orderBy: {
      pubDate: 'desc',
    },
  });

  const feed = generateRss({
    title: 'The Launch List Weekly Digest',
    description:
      'The latest posts from The Launch List. Weekly updates on space launches, astronauts, and more.',
    link: 'https://launchlist.space',
    posts: posts.map((post: NewsletterPost) => ({
      id: post.id.toString(),
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

  // Generate ETag based on content and latest post date
  const latestPostDate =
    posts.length > 0
      ? new Date(posts[0].pubDate ?? new Date()).getTime().toString()
      : new Date().getTime().toString();
  const etag = `"${Buffer.from(latestPostDate).toString('base64')}"`;

  // Check if client has matching ETag
  const ifNoneMatch = request.headers.get('if-none-match');
  if (ifNoneMatch === etag) {
    return new Response(null, { status: 304 });
  }

  return new Response(feed, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control':
        'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      'Surrogate-Control': 'max-age=0, s-maxage=0',
      Pragma: 'no-cache',
      Expires: '0',
      ETag: etag,
      'Last-Modified': new Date().toUTCString(),
      Vary: '*',
    },
  });
};

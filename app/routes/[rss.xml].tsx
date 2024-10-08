import { LoaderFunction } from "@remix-run/cloudflare";

export type RssPost = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  guid?: string;
  author?: string;
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
        <atom:link href="https://keith.is/rss.xml" rel="self" type="application/rss+xml" />`;

  const rssBody = posts
    .map(
      (post) => `
          <item>
            <title><![CDATA[${post.title}]]></title>
            <description><![CDATA[${post.description}]]></description>
            <pubDate>${post.pubDate}</pubDate>
            <link>${post.link}</link>
            <guid isPermaLink="false">${post.link}</guid>
          </item>`,
    )
    .join("");

  const rssFooter = `
      </channel>
    </rss>`;

  return rssHeader + rssBody + rssFooter;
}

export const loader: LoaderFunction = async () => {
  const posts = [
    {
      title: "Hello, world!",
      slug: "hello-world",
      pubDate: "2022-01-01",
      description: "This is my first post.",
      excerpt: "This is my first post.",
      guid: "https://keith.is/post/hello-world",
      author: "Keith",
    },
  ];
  const feed = generateRss({
    title: "Keith's Blog",
    description: "A blog about web development and other things.",
    link: "https://keith.is",
    posts: posts.map((post) => ({
      title: post.title,
      link: `https://keith.is/post/${post.slug}`,
      description: post.excerpt,
      pubDate: new Date(post.pubDate).toUTCString(),
    })),
  });

  return new Response(feed, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=2419200",
    },
  });
};

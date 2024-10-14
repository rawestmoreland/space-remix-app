import { prisma } from '@/prisma';
import { ArticleType } from '@prisma/client';
import axios from 'axios';

export async function fetchArticles({
  limit = 40,
  afterDate,
  searchTerm,
}: {
  limit?: number;
  afterDate?: Date;
  searchTerm?: string;
}) {
  const url = new URL(process.env.SF_NEWS_BASE_URL!);

  // Build the URL
  url.pathname += '/articles';
  url.searchParams.append('ordering', '-published_at');
  url.searchParams.append('limit', limit.toString());
  if (afterDate) {
    url.searchParams.append('published_at_gt', afterDate.toISOString());
  }
  if (searchTerm) {
    url.searchParams.append('search', searchTerm);
  }

  try {
    const response = await axios.get(url.toString());

    const articles = response.data;
    return articles;
  } catch (error) {
    console.error(`Error fetching articles: ${error}`);
    return null;
  }
}

export async function fetchBlogPosts({
  limit = 40,
  afterDate,
  searchTerm,
}: {
  limit?: number;
  afterDate?: Date;
  searchTerm?: string;
}) {
  const url = new URL(process.env.SF_NEWS_BASE_URL!);

  // Build the URL
  url.pathname += '/blogs';
  url.searchParams.append('ordering', '-published_at');
  url.searchParams.append('limit', limit.toString());
  if (afterDate) {
    url.searchParams.append('published_at_gt', afterDate.toISOString());
  }
  if (searchTerm) {
    url.searchParams.append('search', searchTerm);
  }

  try {
    const response = await axios.get(url.toString());

    const articles = response.data;
    return articles;
  } catch (error) {
    console.error(`Error fetching blogs: ${error}`);
    return null;
  }
}

export async function getLatestArticleDate() {
  try {
    const latestArticle = await prisma.article.findFirst({
      where: {
        articleType: ArticleType.ARTICLE,
      },
      orderBy: {
        publishedAt: 'desc',
      },
    });

    return latestArticle?.publishedAt;
  } catch (error) {
    console.error(`Error fetching latest article date: ${error}`);
    return undefined;
  }
}

export async function getLatestBlogPostDate() {
  try {
    const latestBlogPost = await prisma.article.findFirst({
      where: {
        articleType: ArticleType.BLOG,
      },
      orderBy: {
        publishedAt: 'desc',
      },
    });

    return latestBlogPost?.publishedAt;
  } catch (error) {
    console.error(`Error fetching latest blog post date: ${error}`);
    return undefined;
  }
}

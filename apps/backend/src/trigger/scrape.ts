import {
  fetchArticles,
  fetchBlogPosts,
  getLatestArticleDate,
  getLatestBlogPostDate,
} from '@/common/utils/articles';
import { articleScraper } from '@/common/utils/articleScraper';
import { prisma } from '@/prisma';
import { ArticleSource, ArticleType } from '@prisma/client';
import { logger, schedules } from '@trigger.dev/sdk/v3';

export const scrapeNewArticles = schedules.task({
  id: 'scrape-new-articles',
  // every top of the hour
  cron: '0 * * * *',
  maxDuration: 300, // 5 minutes
  run: async (payload, { ctx }) => {
    let articleCount = 0;
    const latestArticleDate = await getLatestArticleDate();

    const latestBlogPostDate = await getLatestBlogPostDate();

    const latestBlogPosts = await fetchBlogPosts({
      afterDate: latestBlogPostDate,
    });

    const latestArticles = await fetchArticles({
      afterDate: latestArticleDate,
    });

    if (!latestArticles?.results && !latestBlogPosts?.results) {
      return logger.log("Couldn't find any new articles or blog posts");
    }

    if (latestArticles.results) {
      for (const article of latestArticles.results) {
        if (article.url) {
          const existingArticle = await prisma.article.findFirst({
            where: {
              url: article.url,
            },
          });

          // If the article already exists, skip it
          if (existingArticle) {
            continue;
          }

          const data = await articleScraper(article.url);

          // If the article could not be scraped, skip it
          if (!data || data.success === false) {
            continue;
          }
          // Create the article in the database
          await prisma.article.create({
            data: {
              title: article.title,
              url: article.url,
              publishedAt: new Date(article.published_at),
              source: ArticleSource.SPACEFLIGHT_NEWS_API,
              articleType: ArticleType.ARTICLE,
              newsSite: article.news_site,
              sourceId: article.id,
              ScrapedArticle: {
                create: {
                  content: data.message,
                },
              },
            },
          });

          articleCount++;
        }
      }
    }

    if (latestBlogPosts.results) {
      for (const blogPost of latestBlogPosts.results) {
        if (blogPost.url) {
          const existingPost = await prisma.article.findFirst({
            where: {
              url: blogPost.url,
            },
          });

          // If the article already exists, skip it
          if (existingPost) {
            continue;
          }

          const data = await articleScraper(blogPost.url);

          // If the article could not be scraped, skip it
          if (!data || data.success === false) {
            continue;
          }
          // Create the article in the database
          await prisma.article.create({
            data: {
              title: blogPost.title,
              url: blogPost.url,
              publishedAt: new Date(blogPost.published_at),
              source: ArticleSource.SPACEFLIGHT_NEWS_API,
              articleType: ArticleType.BLOG,
              newsSite: blogPost.news_site,
              sourceId: blogPost.id,
              ScrapedArticle: {
                create: {
                  content: data.message,
                },
              },
            },
          });

          articleCount++;
        }
      }
    }

    logger.log(`${articleCount} articles / blogs scraped`);
  },
});

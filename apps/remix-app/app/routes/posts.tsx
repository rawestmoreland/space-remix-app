import { prisma } from '~/db.server';
import { json, Link, useLoaderData } from '@remix-run/react';
import { NewsletterPost } from '@prisma/client';

export async function loader() {
  const posts = await prisma.newsletterPost.findMany({
    orderBy: {
      pubDate: 'desc',
    },
  });

  return json({ posts });
}

export default function Posts() {
  const { posts } = useLoaderData<typeof loader>();

  console.log(posts);

  // Parse date fields back into Date objects
  const parsedPosts = posts.map((post) => ({
    ...post,
    createdAt: new Date(post.createdAt),
    pubDate: post.pubDate ? new Date(post.pubDate) : null,
  }));

  return (
    <main className='flex-1'>
      <div className='mx-auto mb-8 w-full max-w-2xl px-4 md:px-0'>
        <div className='flex flex-col gap-4 mt-8'>
          {parsedPosts.map((post: NewsletterPost, index: number) => (
            <div
              key={post.id}
              className={`group ${index !== parsedPosts.length - 1} ? 'border-b-2' : ''`}
            >
              <Link
                to={`/post/${post.slug}`}
                className='flex flex-col gap-4 border-2 shadow-xl p-4 rounded-xl'
              >
                <div className='flex flex-col gap-1'>
                  <p className='text-xs'>
                    Week of{' '}
                    {post.pubDate?.toLocaleDateString('us-en', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                  <h2 className='text-2xl font-semibold group-hover:underline underline-offset-2'>
                    {post.title}
                  </h2>
                </div>
                <p>{post.description}</p>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

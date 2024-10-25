import { prisma } from '~/db.server';
import invariant from 'tiny-invariant';
import { LoaderFunctionArgs } from '@remix-run/node';
import { json, useLoaderData } from '@remix-run/react';

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.slug, 'No slug provided');
  const post = await prisma.newsletterPost.findUnique({
    where: {
      slug: params.slug,
    },
  });

  if (!post) {
    throw new Response('Not Found', { status: 404 });
  }

  return json({ post });
}

export default function Summary() {
  const { post } = useLoaderData<typeof loader>();

  return (
    <main className='flex-1'>
      <div className='mx-auto mb-8 w-full max-w-xl px-4 md:px-0 mt-8'>
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </div>
    </main>
  );
}

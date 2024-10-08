import { ActionFunctionArgs } from '@remix-run/node';
import { json, useFetcher, type MetaFunction } from '@remix-run/react';
import {
  CalendarIcon,
  ChevronRightIcon,
  MailIcon,
  NewspaperIcon,
  RocketIcon,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { FormSuccessDialog } from '~/components/form-success-dialog';
import { Testimonial } from '~/components/testimonial';
import { AnimatedSubscribeButton } from '~/components/ui/animated-subscribe-button';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { ITestimonial, testimonials } from '~/lib/constants';
import { createContact } from '~/services/sendfoxService';

export const meta: MetaFunction = () => {
  return [
    { title: 'Launch List' },
    {
      name: 'description',
      content:
        'Welcome to the most comprehensive space launch site in the world!',
    },
    {
      property: 'og:image',
      content: 'https://launchlist.space/placeholder-rocket.jpg',
    },
  ];
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const email = formData.get('email') as string;
  const { data, error } = await createContact(email);
  if (error) {
    return json({ ok: false, data: null });
  }
  return json({ data, ok: true });
};

export default function Index() {
  const formRef = useRef<HTMLFormElement>(null);
  const fetcher = useFetcher<typeof action>();
  const [displayFormSuccess, setDisplayFormSuccess] = useState(false);

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data?.ok === true) {
      setDisplayFormSuccess(true);
    } else if (fetcher.state === 'idle' && !fetcher.data?.ok === false) {
      alert('An error occurred. Please try again later.');
    }
  }, [fetcher.state, fetcher.data]);

  return (
    <main className='flex-1'>
      <section className='w-full bg-slate-50 py-12 md:py-24 lg:py-32 xl:py-48'>
        <div className='container mx-auto max-w-6xl px-4 md:px-6'>
          <div className='overflow-hidden flex flex-col items-center space-y-4 text-center'>
            <div className='space-y-2'>
              <h2 className='text-xl font-bold tracking-tighter sm:text-4xl md:text-3xl lg:text-4xl/none'>
                Launching soon!
              </h2>
              <h1 className='text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none'>
                Your Weekly Dose of Space Exploration
              </h1>
              <p className='mx-auto max-w-[700px] text-gray-500 dark:text-gray-400 md:text-xl'>
                Stay informed about upcoming rocket launches, space missions,
                and industry news with our curated weekly newsletter.
              </p>
            </div>
            <div className='w-full max-w-sm space-y-2'>
              <fetcher.Form
                ref={formRef}
                method='post'
                className='flex flex-col gap-2 md:flex-row'
              >
                <Input
                  name='email'
                  required
                  className='flex-1'
                  placeholder='Enter your email'
                  type='email'
                />
                <AnimatedSubscribeButton
                  type='submit'
                  buttonColor={`rgb(220, 90, 50)`}
                  buttonTextColor='white'
                  subscribeStatus={
                    fetcher.state === 'idle' && fetcher.data?.ok === true
                  }
                  initialText={
                    <span className='text-sm group inline-flex items-center'>
                      Subscribe{' '}
                      <ChevronRightIcon className='ml-1 size-4 transition-transform duration-300 group-hover:translate-x-1' />
                    </span>
                  }
                  changeText={
                    <span className='text-sm group inline-flex items-center'>
                      <RocketIcon className='mr-1 size-4' />
                      Subscribed!
                    </span>
                  }
                />
              </fetcher.Form>
              <p className='text-xs text-gray-500 dark:text-gray-400'>
                Join our growing list of space enthusiasts. Unsubscribe at any
                time.
              </p>
            </div>
          </div>
        </div>
      </section>
      <FormSuccessDialog
        isOpen={displayFormSuccess}
        onClose={() => {
          formRef.current?.reset();
          setDisplayFormSuccess(false);
        }}
      />
    </main>
  );

  return (
    <main className='flex-1'>
      <section className='w-full bg-slate-50 py-12 md:py-24 lg:py-32 xl:py-48'>
        <div className='container mx-auto max-w-6xl px-4 md:px-6'>
          <div className='flex flex-col items-center space-y-4 text-center'>
            <div className='space-y-2'>
              <h1 className='text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none'>
                Your Weekly Dose of Space Exploration
              </h1>
              <p className='mx-auto max-w-[700px] text-gray-500 dark:text-gray-400 md:text-xl'>
                Stay informed about upcoming rocket launches, space missions,
                and industry news with our curated weekly newsletter.
              </p>
            </div>
            <div className='w-full max-w-sm space-y-2'>
              <fetcher.Form
                ref={formRef}
                method='post'
                className='flex flex-col gap-2 sm:flex-row'
              >
                <Input
                  name='email'
                  required
                  className='flex-1'
                  placeholder='Enter your email'
                  type='email'
                />
                <Button type='submit'>
                  Subscribe
                  <ChevronRightIcon className='ml-2 h-4 w-4' />
                </Button>
              </fetcher.Form>
              <p className='text-xs text-gray-500 dark:text-gray-400'>
                Join over 10,000 space enthusiasts. Unsubscribe at any time.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className='w-full py-12 md:py-24 lg:py-32'>
        <div className='container mx-auto max-w-6xl px-4 md:px-6'>
          <div className='grid gap-10 sm:grid-cols-2 lg:grid-cols-3'>
            <div className='flex flex-col items-center space-y-4 text-center'>
              <div className='rounded-full bg-primary p-3'>
                <MailIcon className='h-6 w-6 text-white' />
              </div>
              <h2 className='text-xl font-bold'>Weekly Digest</h2>
              <p className='text-gray-500 dark:text-gray-400'>
                Receive a comprehensive summary of the week&apos;s most
                important space events and launches.
              </p>
            </div>
            <div className='flex flex-col items-center space-y-4 text-center'>
              <div className='rounded-full bg-primary p-3'>
                <CalendarIcon className='h-6 w-6 text-white' />
              </div>
              <h2 className='text-xl font-bold'>Launch Calendar</h2>
              <p className='text-gray-500 dark:text-gray-400'>
                Get an up-to-date schedule of upcoming rocket launches from
                around the world.
              </p>
            </div>
            <div className='flex flex-col items-center space-y-4 text-center'>
              <div className='rounded-full bg-primary p-3'>
                <NewspaperIcon className='h-6 w-6 text-white' />
              </div>
              <h2 className='text-xl font-bold'>Industry Insights</h2>
              <p className='text-gray-500 dark:text-gray-400'>
                Dive into expert analysis and breaking news from the space
                industry.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className='w-full bg-slate-50 py-12 md:py-24 lg:py-32'>
        <div className='container mx-auto max-w-6xl px-4 md:px-6'>
          <div className='flex flex-col items-center justify-center space-y-4 text-center'>
            <div className='space-y-2'>
              <h2 className='text-3xl font-bold tracking-tighter md:text-4xl'>
                What Our Readers Say
              </h2>
              <p className='mx-auto max-w-[600px] text-gray-500 dark:text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed'>
                Join thousands of space enthusiasts who trust Launch List for
                their weekly space updates.
              </p>
            </div>
            <div className='grid gap-6 lg:grid-cols-3'>
              {testimonials.map((testimonial: ITestimonial) => (
                <Testimonial
                  key={`testimonial-${testimonial.order}`}
                  quote={testimonial.quote}
                  author={testimonial.author}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className='w-full py-12 md:py-24 lg:py-32'>
        <div className='container mx-auto max-w-6xl px-4 md:px-6'>
          <div className='flex flex-col items-center justify-center space-y-4 text-center'>
            <div className='space-y-2'>
              <h2 className='text-3xl font-bold tracking-tighter md:text-4xl'>
                Ready for Liftoff?
              </h2>
              <p className='mx-auto max-w-[600px] text-gray-500 dark:text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed'>
                Subscribe now and never miss an important space event again.
                Your journey through the cosmos starts here.
              </p>
            </div>
            <div className='w-full max-w-sm space-y-2'>
              <fetcher.Form
                method='post'
                ref={formRef}
                className='flex flex-col gap-2 sm:flex-row'
              >
                <Input
                  name='email'
                  required
                  className='flex-1'
                  placeholder='Enter your email'
                  type='email'
                />
                <Button type='submit'>
                  Join Now
                  <RocketIcon className='ml-2 h-4 w-4' />
                </Button>
              </fetcher.Form>
            </div>
          </div>
        </div>
      </section>
      <FormSuccessDialog
        isOpen={displayFormSuccess}
        onClose={() => {
          formRef.current?.reset();
          setDisplayFormSuccess(false);
        }}
      />
    </main>
  );
}

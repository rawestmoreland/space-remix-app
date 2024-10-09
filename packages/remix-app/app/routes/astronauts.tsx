import { useLoaderData, json } from '@remix-run/react';
import { AstronautCard } from '~/components/astronaut-card';
import { AstronautDetail } from '~/components/astronaut-detail';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import { TypographyH1 } from '~/components/ui/typography';
import { getAstronauts, IAstronaut } from '~/services/astronautService';

export async function loader() {
  const { env } = process;
  const { data, error } = await getAstronauts(`${env.LL_BASE_URL!}/astronauts`);
  if (error) {
    throw json({ error }, { status: 500 });
  }
  return json({ astronauts: data });
}

export default function Astronauts() {
  const { astronauts } = useLoaderData<typeof loader>();
  return (
    <div className='flex-1'>
      <div className='mx-auto w-full max-w-6xl px-4 md:px-0'>
        <div className='my-4'>
          <TypographyH1>Astronauts</TypographyH1>
        </div>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {astronauts.results.map((astronaut: IAstronaut) => (
            <Dialog key={astronaut.id}>
              <DialogTrigger asChild>
                <div className='cursor-pointer'>
                  <AstronautCard astronaut={astronaut} />
                </div>
              </DialogTrigger>
              <DialogContent className='max-w-3xl'>
                <DialogHeader>
                  <DialogTitle>Astronaut Details</DialogTitle>
                </DialogHeader>
                <AstronautDetail astronaut={astronaut} />
              </DialogContent>
            </Dialog>
          ))}
        </div>
      </div>
    </div>
  );
}

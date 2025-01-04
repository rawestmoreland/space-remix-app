import Particles from './ui/particles';
import { TypographyLarge, TypographyMuted } from './ui/typography';

export function Testimonial({
  quote,
  author,
}: {
  quote: string;
  author: string;
}) {
  return (
    <div className='relative rounded-xl bg-background p-8 shadow-xl'>
      <div className='flex flex-col gap-4'>
        <TypographyMuted>&quot;{quote}&quot;</TypographyMuted>
        <TypographyLarge>- {author}</TypographyLarge>
        <Particles
          className='absolute inset-0'
          quantity={100}
          ease={80}
          color='#FFFFFF'
          refresh
        />
      </div>
    </div>
  );
}

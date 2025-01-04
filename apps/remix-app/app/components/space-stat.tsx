import { Link } from '@remix-run/react';
import Particles from '~/components/ui/particles';
import { cn } from '~/lib/utils';

interface SpaceStatProps {
  title: string;
  value: string;
  to?: string;
  className?: string;
}

export function SpaceStat({ title, value, to, className }: SpaceStatProps) {
  const CardContent = () => (
    <div
      className={cn(
        'relative rounded-xl bg-background p-8 shadow-xl h-[240px] flex flex-col items-center justify-center group hover:shadow-2xl transition-all duration-300',
        className
      )}
    >
      <div className='flex flex-col gap-6 items-center text-center z-10 w-full'>
        <p className='text-xl font-semibold text-primary/80 group-hover:text-primary transition-colors'>
          {title}
        </p>
        <p className='text-4xl leading-tight font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent break-words max-w-full'>
          {value}
        </p>
      </div>
      <Particles
        className='absolute inset-0 opacity-50 group-hover:opacity-70 transition-opacity'
        quantity={40}
        ease={100}
        color='#FFFFFF'
        refresh
      />
    </div>
  );

  return to ? (
    <Link to={to}>
      <CardContent />
    </Link>
  ) : (
    <CardContent />
  );
}

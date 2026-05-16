import type { ReactNode } from 'react';
import { cn } from './ui/utils';
import blueboothBg from './images/bluebooth-bg.png';

interface BoothPageShellProps {
  children: ReactNode;
  className?: string;
}

export function BoothPageShell({ children, className }: BoothPageShellProps) {
  return (
    <div
      className={cn('relative min-h-dvh w-full overflow-x-hidden text-foreground', className)}
      style={{
        backgroundImage: `url(${blueboothBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {children}
    </div>
  );
}

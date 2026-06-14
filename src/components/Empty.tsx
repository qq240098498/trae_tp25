import { cn } from '@/lib/utils';
import { CarFront } from 'lucide-react';

interface EmptyProps {
  className?: string;
  iconSize?: number;
}

export default function Empty({ className, iconSize = 48 }: EmptyProps) {
  return (
    <div
      className={cn(
        'flex h-full w-full items-center justify-center',
        className
      )}
    >
      <div className="flex flex-col items-center gap-2">
        <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center">
          <CarFront
            className="text-neutral-300"
            style={{ width: iconSize * 0.6, height: iconSize * 0.6 }}
          />
        </div>
      </div>
    </div>
  );
}

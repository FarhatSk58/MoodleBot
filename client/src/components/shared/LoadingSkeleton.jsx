import { cn } from '../../lib/utils';

export default function LoadingSkeleton({ count = 3, height = 'h-20' }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn('animate-pulse bg-slate-200 rounded-xl w-full', height)}
        />
      ))}
    </div>
  );
}

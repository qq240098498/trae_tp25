import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  gradient: string;
  className?: string;
}

export default function StatCard({ title, value, subtitle, icon, gradient, className }: StatCardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl p-5 text-white shadow-card hover:shadow-card-hover transition-shadow duration-300 animate-slide-up',
        gradient,
        className
      )}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-white/80">{title}</span>
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
            {icon}
          </div>
        </div>
        <div className="text-3xl font-bold tracking-tight">{value}</div>
        {subtitle && <div className="text-xs text-white/70 mt-1">{subtitle}</div>}
      </div>
    </div>
  );
}

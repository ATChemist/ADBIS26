import { cn } from '../../../utils/cn';

interface ProgressBarProps {
  value: number;
  max?: number;
  tone?: 'brand' | 'warn' | 'danger';
  label?: string;
}

const toneClass = {
  brand: 'bg-brand-600',
  warn: 'bg-amber-500',
  danger: 'bg-red-600',
};

export function ProgressBar({ value, max = 100, tone = 'brand', label }: ProgressBarProps) {
  const width = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="space-y-1">
      {label ? <div className="text-xs font-semibold text-slate-600">{label}</div> : null}
      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200" aria-label={label} role="progressbar" aria-valuemin={0} aria-valuemax={max} aria-valuenow={Math.round(value)}>
        <div className={cn('h-full rounded-full transition-all', toneClass[tone])} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

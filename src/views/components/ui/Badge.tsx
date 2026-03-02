import type { HTMLAttributes } from 'react';
import { cn } from '../../../utils/cn';

type BadgeTone = 'neutral' | 'brand' | 'warn' | 'danger' | 'ok' | 'info';

const tones: Record<BadgeTone, string> = {
  neutral: 'bg-slate-100 text-slate-800 border-slate-200',
  brand: 'bg-brand-50 text-brand-800 border-brand-200',
  warn: 'bg-amber-50 text-amber-800 border-amber-200',
  danger: 'bg-red-50 text-red-800 border-red-200',
  ok: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  info: 'bg-blue-50 text-blue-800 border-blue-200',
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

export function Badge({ className, tone = 'neutral', children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex min-h-7 items-center gap-1 rounded-full border px-2.5 text-xs font-semibold',
        tones[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

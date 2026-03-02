import type { ReactNode } from 'react';
import { cn } from '../../../utils/cn';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ eyebrow, title, subtitle, actions, className }: PageHeaderProps) {
  return (
    <header className={cn('flex flex-wrap items-start justify-between gap-3', className)}>
      <div>
        {eyebrow ? <p className="text-xs font-semibold uppercase tracking-wide text-brand-800">{eyebrow}</p> : null}
        <h1 className="mt-1 font-display text-2xl font-bold leading-tight text-slate-950 sm:text-3xl">{title}</h1>
        {subtitle ? <p className="mt-2 max-w-3xl text-sm text-slate-600">{subtitle}</p> : null}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </header>
  );
}

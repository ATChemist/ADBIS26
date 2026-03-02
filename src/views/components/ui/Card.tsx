import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../../utils/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
}

export function Card({ className, title, subtitle, actions, children, ...props }: CardProps) {
  return (
    <section
      className={cn(
        'rounded-2xl border border-slate-200 bg-white p-4 shadow-soft sm:p-5',
        className,
      )}
      {...props}
    >
      {(title || subtitle || actions) && (
        <header className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title ? <h2 className="text-base font-bold text-slate-900">{title}</h2> : null}
            {subtitle ? <p className="mt-1 text-sm text-slate-600">{subtitle}</p> : null}
          </div>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </header>
      )}
      {children}
    </section>
  );
}

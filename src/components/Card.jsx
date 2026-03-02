import { cn } from "../utils/cn";

export function Card({ title, subtitle, actions, className, children }) {
  return (
    <section className={cn("surface card-enter p-4 md:p-5", className)}>
      {(title || subtitle || actions) && (
        <header className="mb-4 flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            {title ? <h3 className="section-title text-[1.02rem]">{title}</h3> : null}
            {subtitle ? <p className="mt-1 text-sm text-slate-500/90">{subtitle}</p> : null}
          </div>
          {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
        </header>
      )}
      {children}
    </section>
  );
}

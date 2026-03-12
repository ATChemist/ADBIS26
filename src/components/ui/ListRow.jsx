import { cn } from "../../utils/cn";

export function ListRow({ leading, title, subtitle, trailing, className, onClick, ariaLabel }) {
  const interactiveProps = onClick
    ? {
        role: "button",
        tabIndex: 0,
        onClick,
        onKeyDown: (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onClick();
          }
        },
        "aria-label": ariaLabel ?? title
      }
    : {};

  return (
    <article
      {...interactiveProps}
      className={cn(
        "surface-subtle flex min-h-11 items-center justify-between gap-3 rounded-xl px-3 py-2.5",
        onClick ? "cursor-pointer transition hover:border-app-primary/30 hover:bg-white" : "",
        className
      )}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        {leading ? <div className="shrink-0">{leading}</div> : null}
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-app-text">{title}</p>
          {subtitle ? <p className="truncate text-xs text-app-muted">{subtitle}</p> : null}
        </div>
      </div>
      {trailing ? <div className="shrink-0">{trailing}</div> : null}
    </article>
  );
}

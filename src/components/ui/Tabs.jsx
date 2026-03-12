import { cn } from "../../utils/cn";

export function Tabs({ tabs, value, onChange, ariaLabel = "Tabs", className }) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn("inline-flex rounded-2xl border border-app-border bg-white p-1 shadow-sm", className)}
    >
      {tabs.map((tab) => {
        const active = value === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            tabIndex={active ? 0 : -1}
            aria-selected={active}
            aria-label={tab.label}
            onClick={() => onChange(tab.id)}
            className={cn(
              "min-h-11 rounded-xl px-4 text-sm font-semibold transition duration-200",
              active
                ? "bg-app-primary text-white shadow-sm"
                : "text-app-muted hover:bg-slate-100 hover:text-app-text"
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

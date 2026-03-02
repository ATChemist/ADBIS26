import { cn } from "../utils/cn";

export function Tabs({ tabs, value, onChange, ariaLabel = "Tabs" }) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm"
    >
      {tabs.map((tab) => {
        const isActive = value === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={isActive}
            aria-label={tab.label}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(tab.id)}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-semibold transition duration-200",
              isActive
                ? "bg-brand-600 text-white shadow-sm"
                : "text-slate-700 hover:bg-slate-100 focus-visible:bg-slate-100"
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

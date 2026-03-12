import { cn } from "../../utils/cn";

const typeClasses = {
  status: {
    neutral: "border-app-border bg-app-card text-app-muted",
    info: "border-blue-200 bg-blue-50 text-blue-700",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    warning: "border-amber-200 bg-amber-50 text-amber-700",
    danger: "border-rose-200 bg-rose-50 text-rose-700"
  },
  priority: {
    neutral: "border-app-border bg-app-card text-app-muted",
    info: "border-blue-200 bg-blue-50 text-blue-700",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    warning: "border-amber-200 bg-amber-50 text-amber-700",
    danger: "border-rose-200 bg-rose-50 text-rose-700"
  }
};

export function Badge({ kind = "status", tone = "neutral", className, children }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold tracking-wide",
        typeClasses[kind]?.[tone] ?? typeClasses.status.neutral,
        className
      )}
    >
      {children}
    </span>
  );
}

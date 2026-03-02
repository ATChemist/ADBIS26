import { cn } from "../utils/cn";

const toneClasses = {
  neutral: "border-slate-200 bg-slate-100 text-slate-700",
  info: "border-brand-100 bg-brand-50 text-brand-700",
  success: "border-success-600/20 bg-success-50 text-success-700",
  warning: "border-warning-600/20 bg-warning-50 text-warning-700",
  danger: "border-danger-600/20 bg-danger-50 text-danger-700"
};

export function Badge({ tone = "neutral", className, children }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
        toneClasses[tone] ?? toneClasses.neutral,
        className
      )}
    >
      {children}
    </span>
  );
}

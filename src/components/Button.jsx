import { Loader2 } from "lucide-react";
import { cn } from "../utils/cn";

const variantClasses = {
  primary:
    "bg-brand-600 text-white shadow-sm hover:bg-brand-700 hover:shadow-md focus-visible:ring-brand-600 disabled:bg-brand-300",
  secondary:
    "bg-white text-slate-700 border border-slate-300 hover:bg-slate-100 focus-visible:ring-brand-500 disabled:text-slate-400 disabled:bg-slate-100",
  tertiary:
    "bg-slate-100 text-slate-700 hover:bg-slate-200 focus-visible:ring-brand-500 disabled:text-slate-400 disabled:bg-slate-100",
  danger:
    "bg-danger-600 text-white shadow-sm hover:bg-danger-700 hover:shadow-md focus-visible:ring-danger-600 disabled:bg-danger-300"
};

const sizeClasses = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-base"
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon: Icon,
  className,
  children,
  ...props
}) {
  return (
    <button
      {...props}
      disabled={props.disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed",
        variantClasses[variant] ?? variantClasses.primary,
        sizeClasses[size] ?? sizeClasses.md,
        className
      )}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
      {!loading && Icon ? <Icon className="h-4 w-4" aria-hidden="true" /> : null}
      <span>{children}</span>
    </button>
  );
}

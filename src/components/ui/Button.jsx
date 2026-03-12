import { Loader2 } from "lucide-react";
import { cn } from "../../utils/cn";

const variants = {
  primary:
    "bg-app-primary text-white shadow-sm hover:brightness-105 focus-visible:ring-app-primary disabled:bg-app-primary/50",
  secondary:
    "border border-app-border bg-white text-app-text hover:bg-slate-50 focus-visible:ring-app-primary disabled:text-app-muted",
  ghost:
    "bg-transparent text-app-muted hover:bg-slate-100 hover:text-app-text focus-visible:ring-app-primary disabled:text-app-muted"
};

const sizes = {
  md: "min-h-11 px-4 text-sm",
  lg: "min-h-12 px-5 text-base"
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
      disabled={loading || props.disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
      {!loading && Icon ? <Icon className="h-4 w-4" aria-hidden="true" /> : null}
      <span>{children}</span>
    </button>
  );
}

import { AlertTriangle, Info, XCircle } from "lucide-react";
import { cn } from "../../utils/cn";

const tones = {
  info: {
    wrap: "border-blue-200 bg-blue-50 text-blue-800",
    icon: Info
  },
  warn: {
    wrap: "border-amber-200 bg-amber-50 text-amber-800",
    icon: AlertTriangle
  },
  danger: {
    wrap: "border-rose-200 bg-rose-50 text-rose-800",
    icon: XCircle
  }
};

export function Banner({ tone = "info", title, description, actions, className }) {
  const meta = tones[tone] ?? tones.info;
  const Icon = meta.icon;

  return (
    <div className={cn("rounded-2xl border px-4 py-3", meta.wrap, className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <Icon className="mt-0.5 h-4 w-4" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold">{title}</p>
            {description ? <p className="mt-1 text-xs opacity-90">{description}</p> : null}
          </div>
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}

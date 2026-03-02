import { CheckCircle2, Info, TriangleAlert, XCircle } from "lucide-react";
import { cn } from "../utils/cn";

const toneMeta = {
  success: {
    icon: CheckCircle2,
    className: "border-success-600/20 bg-success-50 text-success-700"
  },
  warning: {
    icon: TriangleAlert,
    className: "border-warning-600/20 bg-warning-50 text-warning-700"
  },
  danger: {
    icon: XCircle,
    className: "border-danger-600/20 bg-danger-50 text-danger-700"
  },
  info: {
    icon: Info,
    className: "border-brand-100 bg-brand-50 text-brand-700"
  }
};

export function ToastStack({ toasts, onDismiss }) {
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2"
    >
      {toasts.map((toast) => {
        const tone = toneMeta[toast.tone] ?? toneMeta.info;
        const Icon = tone.icon;

        return (
          <div
            key={toast.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-panel",
              tone.className
            )}
          >
            <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{toast.title}</p>
              {toast.message ? <p className="mt-1 text-xs opacity-90">{toast.message}</p> : null}
            </div>
            <button
              type="button"
              aria-label="Luk notifikation"
              className="rounded-md px-1 text-xs font-semibold opacity-75 hover:opacity-100"
              onClick={() => onDismiss(toast.id)}
            >
              Luk
            </button>
          </div>
        );
      })}
    </div>
  );
}

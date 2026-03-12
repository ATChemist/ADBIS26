import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "../../utils/cn";

export function Drawer({ open, title, description, side = "right", onClose, children, widthClass = "w-[420px] max-w-[92vw]" }) {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const sideClass = side === "left" ? "left-0" : "right-0";

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Luk panel"
        className="absolute inset-0 bg-slate-900/35"
        onClick={onClose}
      />
      <aside className={cn("absolute top-0 h-full bg-white shadow-md", sideClass, widthClass)}>
        <div className="flex h-full flex-col border-l border-app-border">
          <header className="flex items-start justify-between gap-3 border-b border-app-border px-5 py-4">
            <div>
              <p className="eyebrow">Simulation</p>
              <h3 className="mt-1 text-base font-semibold text-app-text">{title}</h3>
              {description ? <p className="mt-1 text-sm text-app-muted">{description}</p> : null}
            </div>
            <button
              type="button"
              aria-label="Luk simulation panel"
              className="rounded-lg p-1 text-app-muted hover:bg-slate-100"
              onClick={onClose}
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </header>
          <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        </div>
      </aside>
    </div>
  );
}

import { useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "./Button";

export function Modal({
  open,
  title,
  description,
  children,
  confirmLabel,
  cancelLabel = "Luk",
  onConfirm,
  onClose,
  confirmDisabled,
  confirmVariant = "primary",
  footer
}) {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const onEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Luk modal"
        className="absolute inset-0 bg-slate-900/35"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative z-10 w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-xl"
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
          </div>
          <button
            type="button"
            aria-label="Luk dialog"
            className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
            onClick={onClose}
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-4">{children}</div>

        <footer className="mt-5 flex flex-wrap justify-end gap-2">
          {footer ? (
            footer
          ) : (
            <>
              <Button variant="secondary" aria-label={cancelLabel} onClick={onClose}>
                {cancelLabel}
              </Button>
              {confirmLabel ? (
                <Button
                  variant={confirmVariant}
                  aria-label={confirmLabel}
                  onClick={onConfirm}
                  disabled={confirmDisabled}
                >
                  {confirmLabel}
                </Button>
              ) : null}
            </>
          )}
        </footer>
      </div>
    </div>
  );
}

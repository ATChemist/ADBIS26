import { useEffect } from 'react';
import { useAppDispatch, useAppState } from '../../../models/store';
import { cn } from '../../../utils/cn';

const toneStyles = {
  success: 'border-emerald-200 bg-emerald-50',
  info: 'border-blue-200 bg-blue-50',
  warn: 'border-amber-200 bg-amber-50',
  error: 'border-red-200 bg-red-50',
} as const;

export function ToastViewport() {
  const state = useAppState();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!state.toasts.length) return;
    const timers = state.toasts.map((toast) =>
      window.setTimeout(() => dispatch({ type: 'dismissToast', toastId: toast.id }), 2800),
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [dispatch, state.toasts]);

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[min(420px,calc(100%-16px))] flex-col gap-2">
      {state.toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'pointer-events-auto rounded-2xl border p-3 shadow-soft backdrop-blur-sm',
            toneStyles[toast.tone],
          )}
          role="status"
          aria-live="polite"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-slate-900">{toast.title}</p>
              {toast.message ? <p className="mt-1 text-xs text-slate-700">{toast.message}</p> : null}
            </div>
            <button
              type="button"
              className="rounded-lg px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
              onClick={() => dispatch({ type: 'dismissToast', toastId: toast.id })}
            >
              Luk
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

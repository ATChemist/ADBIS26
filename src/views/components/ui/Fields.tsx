import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { cn } from '../../../utils/cn';

interface FieldShellProps {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}

export function FieldShell({ label, hint, error, children }: FieldShellProps) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-800">
      <span>{label}</span>
      {children}
      {error ? <span className="text-xs font-semibold text-red-700">{error}</span> : null}
      {!error && hint ? <span className="text-xs text-slate-500">{hint}</span> : null}
    </label>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        'min-h-12 w-full rounded-xl2 border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 disabled:bg-slate-100',
        props.className,
      )}
    />
  );
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        'min-h-12 w-full rounded-xl2 border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 disabled:bg-slate-100',
        props.className,
      )}
    />
  );
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        'min-h-24 w-full rounded-xl2 border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 disabled:bg-slate-100',
        props.className,
      )}
    />
  );
}

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}

export function Switch({ checked, onChange, label, description, disabled }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={cn(
        'flex w-full items-center justify-between gap-3 rounded-xl2 border px-3 py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400',
        checked ? 'border-brand-300 bg-brand-50' : 'border-slate-300 bg-white',
        disabled && 'cursor-not-allowed opacity-60',
      )}
    >
      <span>
        <span className="block text-sm font-semibold text-slate-900">{label}</span>
        {description ? <span className="block text-xs text-slate-600">{description}</span> : null}
      </span>
      <span
        className={cn(
          'relative inline-flex h-7 w-12 items-center rounded-full transition-colors',
          checked ? 'bg-brand-600' : 'bg-slate-300',
        )}
      >
        <span
          className={cn(
            'inline-block h-5 w-5 transform rounded-full bg-white transition-transform',
            checked ? 'translate-x-6' : 'translate-x-1',
          )}
        />
      </span>
    </button>
  );
}

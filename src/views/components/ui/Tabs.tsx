import { cn } from '../../../utils/cn';

export interface TabOption<T extends string> {
  value: T;
  label: string;
}

interface TabsProps<T extends string> {
  value: T;
  options: Array<TabOption<T>>;
  onChange: (value: T) => void;
  fullWidth?: boolean;
}

export function Tabs<T extends string>({ value, options, onChange, fullWidth }: TabsProps<T>) {
  return (
    <div
      role="tablist"
      aria-label="Filtre"
      className={cn(
        'inline-flex rounded-2xl border border-slate-300 bg-white p-1 shadow-sm',
        fullWidth && 'w-full',
      )}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              'min-h-11 rounded-xl px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400',
              fullWidth && 'flex-1',
              selected
                ? 'bg-brand-600 text-white shadow'
                : 'text-slate-700 hover:bg-slate-100 active:bg-slate-200',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

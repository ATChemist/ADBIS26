import { cloneElement, isValidElement } from 'react';
import type { ButtonHTMLAttributes, ReactElement, ReactNode } from 'react';
import { cn } from '../../../utils/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  iconLeft?: ReactNode;
  asChild?: boolean;
}

const variantMap: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 disabled:bg-slate-300 disabled:text-slate-500',
  secondary:
    'bg-slate-100 text-slate-900 hover:bg-slate-200 active:bg-slate-300 border border-slate-300 disabled:text-slate-400',
  ghost:
    'bg-white/0 text-slate-800 hover:bg-slate-100 active:bg-slate-200 border border-transparent',
  danger:
    'bg-danger text-white hover:bg-red-700 active:bg-red-800 disabled:bg-slate-300 disabled:text-slate-500',
};

const sizeMap: Record<ButtonSize, string> = {
  sm: 'min-h-11 px-3 text-sm rounded-xl',
  md: 'min-h-12 px-4 text-sm rounded-xl2',
  lg: 'min-h-14 px-5 text-base rounded-xl2',
};

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  fullWidth,
  iconLeft,
  asChild = false,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  const classes = cn(
    'inline-flex items-center justify-center gap-2 font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed',
    sizeMap[size],
    variantMap[variant],
    fullWidth && 'w-full',
    className,
  );

  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<{ className?: string; children?: ReactNode }>;
    return cloneElement(child, {
      ...props,
      className: cn(classes, child.props.className),
      children: (
        <>
          {iconLeft ? <span aria-hidden>{iconLeft}</span> : null}
          <span>{child.props.children ?? children}</span>
        </>
      ),
    });
  }

  return (
    <button
      type={type}
      className={classes}
      {...props}
    >
      {iconLeft ? <span aria-hidden>{iconLeft}</span> : null}
      <span>{children}</span>
    </button>
  );
}

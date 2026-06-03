import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/core/lib/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  /** Shows a spinner, sets `aria-busy` and disables the button while truthy. */
  isLoading?: boolean;
  children: ReactNode;
}

const baseClasses =
  'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 ' +
  'text-sm font-medium transition-colors focus-visible:outline-none ' +
  'focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed ' +
  'disabled:opacity-50';

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:ring-indigo-600',
  secondary:
    'bg-slate-200 text-slate-900 hover:bg-slate-300 focus-visible:ring-slate-400',
  ghost:
    'bg-transparent text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-400',
};

/**
 * Minimal, reusable button primitive. More variants/sizes can grow here as the
 * design system matures.
 */
export function Button({
  variant = 'primary',
  className,
  isLoading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(baseClasses, variantClasses[variant], className)}
      aria-busy={isLoading || undefined}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span
          aria-hidden="true"
          className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      ) : null}
      {children}
    </button>
  );
}

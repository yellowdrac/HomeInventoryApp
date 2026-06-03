import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/core/lib/cn';

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  /** Marks the field as invalid; wires up `aria-invalid` and error styling. */
  invalid?: boolean;
};

const baseClasses =
  'flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 ' +
  'text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 ' +
  'focus-visible:border-indigo-600 disabled:cursor-not-allowed disabled:opacity-50';

const invalidClasses =
  'border-red-400 focus-visible:ring-red-500 focus-visible:border-red-500';

/**
 * Accessible text input primitive. Forwards its ref (so react-hook-form's
 * `register` works) and toggles invalid styling plus `aria-invalid`.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid = false, ...props }, ref) => (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(baseClasses, invalid && invalidClasses, className)}
      {...props}
    />
  ),
);

Input.displayName = 'Input';

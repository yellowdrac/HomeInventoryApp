import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from '@/core/lib/cn';

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  /** Marks the field as invalid; wires up `aria-invalid` and error styling. */
  invalid?: boolean;
};

const baseClasses =
  'flex h-10 w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2 ' +
  'text-sm text-slate-900 shadow-sm transition-colors ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ' +
  'focus-visible:border-emerald-600 disabled:cursor-not-allowed disabled:opacity-50';

const invalidClasses =
  'border-red-400 focus-visible:ring-red-500 focus-visible:border-red-500';

/**
 * Accessible native select primitive. Native `<select>` gives keyboard support,
 * disabled options and screen-reader semantics for free. Forwards its ref so
 * react-hook-form's `register` works, and toggles invalid styling/`aria-invalid`.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, invalid = false, children, ...props }, ref) => (
    <select
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(baseClasses, invalid && invalidClasses, className)}
      {...props}
    >
      {children}
    </select>
  ),
);

Select.displayName = 'Select';

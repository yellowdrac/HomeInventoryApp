import type { LabelHTMLAttributes } from 'react';
import { cn } from '@/core/lib/cn';

export type LabelProps = LabelHTMLAttributes<HTMLLabelElement>;

/**
 * Accessible form label. Pair its `htmlFor` with the input `id` so clicking the
 * label focuses the control and screen readers announce the association.
 */
export function Label({ className, children, ...props }: LabelProps) {
  return (
    <label
      className={cn('text-sm font-medium text-slate-700', className)}
      {...props}
    >
      {children}
    </label>
  );
}

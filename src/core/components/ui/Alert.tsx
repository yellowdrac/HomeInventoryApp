import type { ReactNode } from 'react';
import { cn } from '@/core/lib/cn';

type AlertTone = 'error' | 'success' | 'info';

interface AlertProps {
  tone?: AlertTone;
  children: ReactNode;
  className?: string;
}

const toneClasses: Record<AlertTone, string> = {
  error: 'border-red-200 bg-red-50 text-red-800',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  info: 'border-slate-200 bg-white text-slate-700',
};

/**
 * Inline status banner for form-level feedback. Errors use `role="alert"` so
 * assistive tech announces them immediately; non-error tones use a polite
 * `status` role.
 */
export function Alert({ tone = 'info', children, className }: AlertProps) {
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn(
        'rounded-lg border px-3 py-2 text-sm',
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </div>
  );
}

import type { ReactNode } from 'react';
import { Label } from '@/core/components/ui/Label';

/** Accessibility wiring handed to the field control rendered by `FormField`. */
export interface FieldAria {
  id: string;
  invalid: boolean;
  'aria-describedby': string | undefined;
}

interface FormFieldProps {
  /** Stable id used for the control, label association and error wiring. */
  id: string;
  label: string;
  /** Validation message; when present the control is marked invalid. */
  error?: string | undefined;
  /** Optional helper text shown below the label. */
  hint?: string | undefined;
  /** Render the control, spreading the provided aria props onto it. */
  children: (aria: FieldAria) => ReactNode;
}

/**
 * Accessible field wrapper: renders a `<Label>` tied to the control, an optional
 * hint, and a live error message. It builds the `aria-describedby`/`aria-invalid`
 * wiring and passes it to the control via a render prop so associations are never
 * forgotten.
 */
export function FormField({
  id,
  label,
  error,
  hint,
  children,
}: FormFieldProps) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy =
    [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') ||
    undefined;

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {hint ? (
        <p id={hintId} className="text-xs text-slate-500">
          {hint}
        </p>
      ) : null}
      {children({
        id,
        invalid: Boolean(error),
        'aria-describedby': describedBy,
      })}
      {error ? (
        <p id={errorId} role="alert" className="text-sm text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}

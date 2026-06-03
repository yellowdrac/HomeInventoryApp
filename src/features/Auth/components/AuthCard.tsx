import type { ReactNode } from 'react';

interface AuthCardProps {
  title: string;
  description: string;
  children: ReactNode;
  /** Secondary action shown below the form (e.g. link to the other auth view). */
  footer?: ReactNode;
}

/**
 * Centered card shell for the authentication views. Mobile-first: full width on
 * small screens, constrained and centered on larger viewports.
 */
export function AuthCard({
  title,
  description,
  children,
  footer,
}: AuthCardProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {title}
          </h1>
          <p className="text-sm text-slate-600">{description}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {children}
        </div>

        {footer ? (
          <div className="text-center text-sm text-slate-600">{footer}</div>
        ) : null}
      </div>
    </div>
  );
}

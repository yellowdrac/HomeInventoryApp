import type { ReactNode } from 'react';

interface FullLayoutProps {
  children: ReactNode;
}

/**
 * Application shell: a sticky header plus a responsive, centered content
 * container. Mobile-first — the container widens at larger breakpoints.
 */
export function FullLayout({ children }: FullLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center gap-2 px-4 py-3 sm:px-6">
          <span className="text-lg font-semibold tracking-tight">
            🏠 HomeInventory
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}

import { Outlet } from 'react-router';
import { useAuth } from '@features/Auth/hooks/useAuth';
import { BottomTabBar } from '@/core/components/nav/BottomTabBar';
import { IconSidebar } from '@/core/components/nav/IconSidebar';
import { MobileTopBar } from '@/core/components/nav/MobileTopBar';

/**
 * Authenticated app shell — Proposal C layout:
 *   • Desktop (≥ sm): 56 px icon-only sidebar on the left, full-width content.
 *   • Mobile  (< sm): sticky top bar + content + fixed bottom tab bar.
 *
 * Nav is only rendered once a household is set up. The household-setup page
 * gets a bare header so users aren't confused by a partially-working nav.
 */
export function ProtectedLayout() {
  const { hasHousehold } = useAuth();

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Desktop sidebar — hidden on mobile */}
      {hasHousehold ? <IconSidebar /> : null}

      {/* Right column: mobile top bar + page content */}
      <div className="flex min-w-0 flex-1 flex-col">
        {hasHousehold ? (
          <MobileTopBar />
        ) : (
          // Minimal header shown during household setup (no nav items yet).
          <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6">
            <span className="text-[15px] font-semibold tracking-tight text-slate-900">
              HomeInventory
            </span>
          </header>
        )}

        <main className="flex-1 px-4 pt-6 pb-24 sm:px-6 sm:py-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom tab bar — fixed, hidden on desktop */}
      {hasHousehold ? <BottomTabBar /> : null}
    </div>
  );
}

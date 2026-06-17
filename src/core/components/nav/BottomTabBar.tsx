import { NavLink } from 'react-router';
import { cn } from '@/core/lib/cn';
import { PRIMARY_NAV_ITEMS } from './navConfig';

/**
 * Fixed mobile bottom navigation bar — visible only below the `sm` breakpoint.
 * Shows the 5 primary nav items as icon + label tabs with an emerald pill
 * indicator on the active tab.
 */
export function BottomTabBar() {
  return (
    <nav
      aria-label="Primary navigation"
      className="fixed bottom-0 left-0 right-0 z-30 flex h-16 items-stretch border-t border-slate-200 bg-white sm:hidden"
    >
      {PRIMARY_NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end ?? false}
            className={({ isActive }) =>
              cn(
                'flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition-colors',
                isActive ? 'text-emerald-700' : 'text-slate-400',
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    'flex size-8 items-center justify-center rounded-xl transition-colors',
                    isActive ? 'bg-emerald-50' : '',
                  )}
                >
                  <Icon className="size-[18px]" />
                </span>
                {item.label}
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}

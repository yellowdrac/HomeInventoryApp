import { NavLink } from 'react-router';
import { cn } from '@/core/lib/cn';
import { useKitchenOverview } from '@features/Kitchen/hooks/useKitchenOverview';

/**
 * Primary-nav link to the kitchen dashboard with an alert badge showing the
 * combined count of expired + expiring-soon lots. The badge is hidden when the
 * count is zero. Shares the nav link styling used by the other header links.
 */
export function KitchenNavLink() {
  const { data } = useKitchenOverview();
  const alertCount =
    (data?.expiredCount ?? 0) + (data?.expiringSoonCount ?? 0);

  return (
    <NavLink
      to="/kitchen"
      className={({ isActive }) =>
        cn(
          'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
          isActive
            ? 'bg-emerald-50 text-emerald-700'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
        )
      }
    >
      Kitchen
      {alertCount > 0 ? (
        <span
          className="inline-flex min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-xs font-semibold text-white"
          aria-label={`${alertCount} items need attention`}
        >
          {alertCount}
        </span>
      ) : null}
    </NavLink>
  );
}

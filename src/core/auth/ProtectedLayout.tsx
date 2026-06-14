import { NavLink, Outlet } from 'react-router';
import { FullLayout } from '@/core/layouts/FullLayout';
import { Button } from '@/core/components/ui';
import { cn } from '@/core/lib/cn';
import { useAuth } from '@features/Auth/hooks/useAuth';
import { GlobalSearch } from '@features/Search/components/GlobalSearch';
import { KitchenNavLink } from '@features/Kitchen/components/KitchenNavLink';

const NAV_ITEMS = [
  { to: '/', label: 'Home', end: true },
  { to: '/items', label: 'Items', end: false },
  { to: '/locations', label: 'Locations', end: false },
  { to: '/scan', label: 'Scan', end: false },
  { to: '/movements', label: 'History', end: false },
  { to: '/assistant', label: 'Assistant', end: false },
  { to: '/household', label: 'Household', end: false },
];

/**
 * Layout for authenticated areas: the app shell plus a header showing the
 * primary navigation, the signed-in user and a logout action. Renders nested
 * routes via `<Outlet />`.
 */
export function ProtectedLayout() {
  const { user, hasHousehold, logout } = useAuth();

  return (
    <FullLayout
      headerEnd={
        <>
          {hasHousehold ? <GlobalSearch /> : null}
          {hasHousehold ? (
            <nav aria-label="Primary" className="hidden sm:block">
              <ul className="flex items-center gap-1">
                {NAV_ITEMS.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) =>
                        cn(
                          'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                        )
                      }
                    >
                      {item.label}
                    </NavLink>
                  </li>
                ))}
                <li>
                  <KitchenNavLink />
                </li>
              </ul>
            </nav>
          ) : null}
          {user ? (
            <span
              className="hidden text-sm text-slate-600 sm:inline"
              title={user.email}
            >
              {user.email}
            </span>
          ) : null}
          <Button variant="secondary" onClick={logout}>
            Log out
          </Button>
        </>
      }
    >
      <Outlet />
    </FullLayout>
  );
}

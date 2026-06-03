import { Outlet } from 'react-router';
import { FullLayout } from '@/core/layouts/FullLayout';
import { Button } from '@/core/components/ui';
import { useAuth } from '@features/Auth/hooks/useAuth';

/**
 * Layout for authenticated areas: the app shell plus a header showing the
 * signed-in user and a logout action. Renders nested routes via `<Outlet />`.
 */
export function ProtectedLayout() {
  const { user, logout } = useAuth();

  return (
    <FullLayout
      headerEnd={
        <>
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

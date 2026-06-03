import { Navigate, Outlet } from 'react-router';
import { useAuth } from '@features/Auth/hooks/useAuth';

/**
 * Allows only unauthenticated users (e.g. login/register). Authenticated users
 * are redirected into the app, where the household guard takes over if needed.
 */
export function PublicOnlyRoute() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />;
}

/**
 * Requires an authenticated session. Unauthenticated users are sent to login.
 */
export function RequireAuth() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

/**
 * Requires the authenticated user to belong to a household; otherwise routes
 * them to the household setup flow.
 */
export function RequireHousehold() {
  const { hasHousehold } = useAuth();
  return hasHousehold ? <Outlet /> : <Navigate to="/household/setup" replace />;
}

import { Navigate, Outlet, useLocation, useSearchParams } from 'react-router';
import { useAuth } from '@features/Auth/hooks/useAuth';
import { sanitizeReturnUrl } from '@/core/auth/returnUrl';

/**
 * Allows only unauthenticated users (e.g. login/register). Authenticated users
 * are redirected to the preserved `redirect` target (set by `RequireAuth` when
 * they were bounced to login), falling back to the app root. The household
 * guard takes over from there if needed.
 */
export function PublicOnlyRoute() {
  const { isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();

  if (!isAuthenticated) {
    return <Outlet />;
  }

  const target = sanitizeReturnUrl(searchParams.get('redirect'));
  return <Navigate to={target ?? '/'} replace />;
}

/**
 * Requires an authenticated session. Unauthenticated users are sent to login
 * with the location they were trying to reach preserved in a `redirect` query
 * param, so they land back on it after signing in (e.g. a scanned QR deep link).
 */
export function RequireAuth() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (isAuthenticated) {
    return <Outlet />;
  }

  const target = location.pathname + location.search + location.hash;
  const redirect =
    target && target !== '/'
      ? `?redirect=${encodeURIComponent(target)}`
      : '';
  return <Navigate to={`/login${redirect}`} replace />;
}

/**
 * Requires the authenticated user to belong to a household; otherwise routes
 * them to the household setup flow.
 */
export function RequireHousehold() {
  const { hasHousehold } = useAuth();
  return hasHousehold ? <Outlet /> : <Navigate to="/household/setup" replace />;
}

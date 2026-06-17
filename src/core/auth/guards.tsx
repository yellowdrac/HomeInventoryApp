import { useEffect } from 'react';
import { Navigate, Outlet, useLocation, useSearchParams } from 'react-router';
import { useAuth } from '@features/Auth/hooks/useAuth';
import { useAuthStore } from '@features/Auth/store/authStore';
import { apiClient } from '@/core/api/client';
import type { AuthTokens } from '@features/Auth/types';
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
 *
 * On mount, if a refresh token is stored but no access token is present (page
 * reload), it attempts a silent session restore before deciding to redirect.
 */
export function RequireAuth() {
  const { isAuthenticated } = useAuth();
  const isInitializing = useAuthStore((s) => s.isInitializing);
  const location = useLocation();

  useEffect(() => {
    if (!isInitializing) return;

    const { refreshToken, setSession, clearSession } = useAuthStore.getState();
    if (!refreshToken) {
      clearSession();
      return;
    }

    apiClient
      .post<AuthTokens>('/api/auth/refresh', { refreshToken }, { _skipAuthRefresh: true })
      .then(({ data }) => setSession(data))
      .catch(() => clearSession());
  }, []); // run once on mount to restore session

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

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

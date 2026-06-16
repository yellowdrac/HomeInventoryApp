import { useEffect, useRef, type ReactNode } from 'react';
import { useAuthStore } from '@features/Auth/store/authStore';
import { useRefresh } from '@features/Auth/hooks/useRefresh';
import { useTokenRefresh } from '@features/Auth/hooks/useTokenRefresh';

interface AuthBootstrapProps {
  children: ReactNode;
}

/**
 * Restores the session on app load. The access token lives only in memory, so
 * after a reload we exchange the persisted refresh token for a fresh pair before
 * rendering the routes (otherwise the guards would briefly redirect to login).
 *
 * The loading gate is derived entirely from Zustand store state so it resolves
 * correctly even when React (StrictMode) or Vite drop the mutation callbacks.
 */
export function AuthBootstrap({ children }: AuthBootstrapProps) {
  const { mutate: doRefresh } = useRefresh();
  useTokenRefresh();

  const hasRefreshToken = useAuthStore((state) => state.refreshToken !== null);
  const accessToken = useAuthStore((state) => state.accessToken);

  // True only when there is a persisted session to restore but no live token yet.
  const needsBootstrap = hasRefreshToken && accessToken === null;

  const startedRef = useRef(false);

  useEffect(() => {
    if (!needsBootstrap) {
      // Reset so a future session can bootstrap again (e.g. login → logout → login).
      startedRef.current = false;
      return;
    }
    if (startedRef.current) return;
    startedRef.current = true;
    doRefresh(undefined);
    // doRefresh is stable across renders; needsBootstrap controls re-runs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsBootstrap]);

  if (needsBootstrap) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600"
        role="status"
        aria-live="polite"
      >
        <span className="text-sm">Restoring your session...</span>
      </div>
    );
  }

  return <>{children}</>;
}

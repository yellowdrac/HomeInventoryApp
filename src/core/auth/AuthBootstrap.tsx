import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useAuthStore } from '@features/Auth/store/authStore';
import { useRefresh } from '@features/Auth/hooks/useRefresh';

interface AuthBootstrapProps {
  children: ReactNode;
}

/**
 * Restores the session on app load. The access token lives only in memory, so
 * after a reload we exchange the persisted refresh token for a fresh pair before
 * rendering the routes (otherwise the guards would briefly redirect to login).
 */
export function AuthBootstrap({ children }: AuthBootstrapProps) {
  const refresh = useRefresh();
  const hasRefreshToken = useAuthStore((state) => state.refreshToken !== null);
  const accessToken = useAuthStore((state) => state.accessToken);

  // Only block on startup when there is a session to restore but no live token.
  const [bootstrapping, setBootstrapping] = useState(
    () => hasRefreshToken && accessToken === null,
  );
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current || !bootstrapping) {
      return;
    }
    startedRef.current = true;
    refresh.mutate(undefined, {
      onSettled: () => setBootstrapping(false),
    });
  }, [bootstrapping, refresh]);

  if (bootstrapping) {
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

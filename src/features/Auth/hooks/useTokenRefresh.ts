import { useEffect } from 'react';
import { useAuthStore } from '@features/Auth/store/authStore';
import { decodeJwt } from '@features/Auth/lib/jwt';
import { performRefresh } from '@/core/api/client';

const REFRESH_BEFORE_EXPIRY_MS = 5 * 60 * 1000;

/**
 * Schedules a silent token refresh 5 minutes before the current access token
 * expires. Re-arms automatically each time a new token is issued. On refresh
 * failure the session is cleared and the auth guards redirect to login.
 *
 * Uses the same coalesced refreshPromise as the 401 interceptor so proactive
 * and reactive refreshes never race against each other with the same token.
 */
export function useTokenRefresh() {
  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    if (!accessToken) return;

    const claims = decodeJwt(accessToken);
    if (!claims?.exp) return;

    const msUntilRefresh = claims.exp * 1000 - Date.now() - REFRESH_BEFORE_EXPIRY_MS;

    const doRefresh = () => {
      performRefresh().catch(() => useAuthStore.getState().clearSession());
    };

    if (msUntilRefresh <= 0) {
      doRefresh();
      return;
    }

    const id = setTimeout(doRefresh, msUntilRefresh);
    return () => clearTimeout(id);
  }, [accessToken]);
}

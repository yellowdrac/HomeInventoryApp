import { useEffect, useRef } from 'react';
import { useAuthStore } from '@features/Auth/store/authStore';
import { decodeJwt } from '@features/Auth/lib/jwt';
import { useRefresh } from './useRefresh';

const REFRESH_BEFORE_EXPIRY_MS = 5 * 60 * 1000;

/**
 * Schedules a silent token refresh 5 minutes before the current access token
 * expires. Re-arms automatically each time a new token is issued. On refresh
 * failure the session is cleared and the auth guards redirect to login.
 */
export function useTokenRefresh() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const { mutate } = useRefresh();
  const mutateRef = useRef(mutate);
  mutateRef.current = mutate;

  useEffect(() => {
    if (!accessToken) return;

    const claims = decodeJwt(accessToken);
    if (!claims?.exp) return;

    const msUntilRefresh = claims.exp * 1000 - Date.now() - REFRESH_BEFORE_EXPIRY_MS;

    if (msUntilRefresh <= 0) {
      mutateRef.current(undefined);
      return;
    }

    const id = setTimeout(() => mutateRef.current(undefined), msUntilRefresh);
    return () => clearTimeout(id);
  }, [accessToken]);
}

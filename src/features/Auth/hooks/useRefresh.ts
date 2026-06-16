import { useMutation } from '@tanstack/react-query';
import { authApi } from '@features/Auth/api/authApi';
import { useAuthStore } from '@features/Auth/store/authStore';
import type { AuthTokens } from '@features/Auth/types';

/**
 * Exchanges the persisted refresh token for a fresh token pair. Used at startup
 * to restore a session after a reload (the access token lives only in memory).
 */
export function useRefresh() {
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);

  return useMutation<AuthTokens, unknown, void>({
    mutationFn: () => {
      const refreshToken = useAuthStore.getState().refreshToken;
      if (!refreshToken) {
        return Promise.reject(new Error('No refresh token available'));
      }
      return authApi.refresh({ refreshToken });
    },
    onSuccess: (tokens) => setSession(tokens),
    onError: () => clearSession(),
  });
}

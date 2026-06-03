import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@features/Auth/store/authStore';
import type { AuthTokens, AuthUser } from '@features/Auth/types';

interface UseAuthResult {
  user: AuthUser | null;
  isAuthenticated: boolean;
  hasHousehold: boolean;
  /** Persists a token pair (used by the login/register/household mutations). */
  login: (tokens: AuthTokens) => void;
  /** Clears the session and any cached server state. */
  logout: () => void;
}

/**
 * Primary auth entry point for components: exposes the current user, derived
 * flags and the login/logout actions. Reads reactive state from the Zustand
 * store so consumers re-render on session changes.
 */
export function useAuth(): UseAuthResult {
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);
  const queryClient = useQueryClient();

  const login = useCallback(
    (tokens: AuthTokens) => setSession(tokens),
    [setSession],
  );

  const logout = useCallback(() => {
    clearSession();
    queryClient.clear();
  }, [clearSession, queryClient]);

  return {
    user,
    isAuthenticated: Boolean(accessToken && user),
    hasHousehold: Boolean(user?.householdId),
    login,
    logout,
  };
}

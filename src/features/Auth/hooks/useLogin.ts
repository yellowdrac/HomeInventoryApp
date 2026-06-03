import { useMutation } from '@tanstack/react-query';
import { authApi } from '@features/Auth/api/authApi';
import { useAuth } from '@features/Auth/hooks/useAuth';
import type { AuthTokens, LoginRequest } from '@features/Auth/types';

/**
 * Logs a user in and stores the returned token pair. On success the auth store
 * is updated, which flips `isAuthenticated` and lets the route guard proceed.
 *
 * The error is surfaced through the mutation's own `error`; the view maps it to
 * a specific message via `getAuthErrorMessage`.
 */
export function useLogin() {
  const { login } = useAuth();

  return useMutation<AuthTokens, unknown, LoginRequest>({
    mutationFn: (payload) => authApi.login(payload),
    onSuccess: (tokens) => login(tokens),
  });
}

import { useMutation } from '@tanstack/react-query';
import { authApi } from '@features/Auth/api/authApi';
import { useAuth } from '@features/Auth/hooks/useAuth';
import type { AuthTokens, RegisterRequest } from '@features/Auth/types';

/**
 * Registers a new account and stores the returned token pair. The new user has
 * no household yet, so the guard will route them to the household setup view.
 */
export function useRegister() {
  const { login } = useAuth();

  return useMutation<AuthTokens, unknown, RegisterRequest>({
    mutationFn: (payload) => authApi.register(payload),
    onSuccess: (tokens) => login(tokens),
  });
}

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { householdApi } from '@features/Household/api/householdApi';
import { householdQueryKey } from '@features/Household/hooks/useMyHousehold';
import { useAuth } from '@features/Auth/hooks/useAuth';
import type { AuthTokens } from '@features/Auth/types';
import type { CreateHouseholdRequest } from '@features/Household/types';

/**
 * Creates a household for the current user. The backend returns a fresh token
 * pair carrying the new `householdId`, so we update the session — which flips
 * `hasHousehold` and lets the guard into the app.
 */
export function useCreateHousehold() {
  const { login } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<AuthTokens, unknown, CreateHouseholdRequest>({
    mutationFn: (payload) => householdApi.create(payload),
    onSuccess: (tokens) => {
      login(tokens);
      void queryClient.invalidateQueries({ queryKey: householdQueryKey });
    },
  });
}

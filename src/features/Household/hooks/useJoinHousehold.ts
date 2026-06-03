import { useMutation, useQueryClient } from '@tanstack/react-query';
import { householdApi } from '@features/Household/api/householdApi';
import { householdQueryKey } from '@features/Household/hooks/useMyHousehold';
import { useAuth } from '@features/Auth/hooks/useAuth';
import type { AuthTokens } from '@features/Auth/types';
import type { JoinHouseholdRequest } from '@features/Household/types';

/**
 * Joins an existing household by its join code. Like creation, the backend
 * re-issues tokens carrying the new `householdId`, so we update the session.
 */
export function useJoinHousehold() {
  const { login } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<AuthTokens, unknown, JoinHouseholdRequest>({
    mutationFn: (payload) => householdApi.join(payload),
    onSuccess: (tokens) => {
      login(tokens);
      void queryClient.invalidateQueries({ queryKey: householdQueryKey });
    },
  });
}

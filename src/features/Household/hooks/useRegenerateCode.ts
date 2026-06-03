import { useMutation, useQueryClient } from '@tanstack/react-query';
import { householdApi } from '@features/Household/api/householdApi';
import { householdQueryKey } from '@features/Household/hooks/useMyHousehold';
import type { HouseholdResponse } from '@features/Household/types';

/**
 * Regenerates the household join code (owner only). Seeds the household query
 * cache with the updated response so the UI reflects the new code immediately.
 */
export function useRegenerateCode() {
  const queryClient = useQueryClient();

  return useMutation<HouseholdResponse, unknown, void>({
    mutationFn: () => householdApi.regenerateCode(),
    onSuccess: (household) => {
      queryClient.setQueryData(householdQueryKey, household);
    },
  });
}

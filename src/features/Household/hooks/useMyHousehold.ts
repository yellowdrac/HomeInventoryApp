import { useQuery } from '@tanstack/react-query';
import { householdApi } from '@features/Household/api/householdApi';
import { useAuth } from '@features/Auth/hooks/useAuth';

export const householdQueryKey = ['household', 'me'] as const;

/**
 * Reads the current user's household. Only enabled once the user actually has a
 * household, so it never fires the 404 path for users still in setup.
 */
export function useMyHousehold() {
  const { hasHousehold } = useAuth();

  return useQuery({
    queryKey: householdQueryKey,
    queryFn: () => householdApi.getMine(),
    enabled: hasHousehold,
  });
}

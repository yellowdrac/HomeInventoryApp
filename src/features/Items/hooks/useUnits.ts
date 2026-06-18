import { useQuery } from '@tanstack/react-query';
import { unitsApi } from '@features/Items/api/unitsApi';

export function useUnits() {
  return useQuery({
    queryKey: ['units'],
    queryFn: () => unitsApi.list(),
    staleTime: Infinity,
  });
}

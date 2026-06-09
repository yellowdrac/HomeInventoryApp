import { useQuery } from '@tanstack/react-query';
import { locationsApi } from '@features/Locations/api/locationsApi';

export const locationTreeQueryKey = ['locations', 'tree'] as const;

/** Reads the household's full location tree (roots with nested children). */
export function useLocationTree() {
  return useQuery({
    queryKey: locationTreeQueryKey,
    queryFn: () => locationsApi.getTree(),
  });
}

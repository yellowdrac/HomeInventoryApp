import { useQuery } from '@tanstack/react-query';
import { locationsApi } from '@features/Locations/api/locationsApi';

export const locationContentsQueryKey = (id: string) =>
  ['locations', 'contents', id] as const;

/**
 * Reads the stock lots stored directly at a location. Disabled until an id is
 * provided so it never fires for an unselected node.
 */
export function useLocationContents(id: string | null) {
  return useQuery({
    queryKey: locationContentsQueryKey(id ?? ''),
    queryFn: () => locationsApi.getContents(id!),
    enabled: Boolean(id),
  });
}

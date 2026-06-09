import { useQuery } from '@tanstack/react-query';
import { locationsApi } from '@features/Locations/api/locationsApi';

export const locationDetailQueryKey = (id: string) =>
  ['locations', 'detail', id] as const;

/**
 * Reads a single location's detail (including its breadcrumb). Disabled until an
 * id is provided so it never fires for an unselected node.
 */
export function useLocation(id: string | null) {
  return useQuery({
    queryKey: locationDetailQueryKey(id ?? ''),
    queryFn: () => locationsApi.getById(id!),
    enabled: Boolean(id),
  });
}

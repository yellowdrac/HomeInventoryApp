import { useQuery } from '@tanstack/react-query';
import { itemsApi } from '@features/Items/api/itemsApi';

export const itemDetailQueryKey = (id: string) =>
  ['items', 'detail', id] as const;

/**
 * Reads a single item's detail (including its stock lots). Disabled until an id
 * is provided so it never fires for an unselected item.
 */
export function useItem(id: string | null) {
  return useQuery({
    queryKey: itemDetailQueryKey(id ?? ''),
    queryFn: () => itemsApi.getById(id!),
    enabled: Boolean(id),
  });
}

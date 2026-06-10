import { useMutation, useQueryClient } from '@tanstack/react-query';
import { kitchenApi } from '@features/Kitchen/api/kitchenApi';
import { invalidateItemData } from '@features/Items/lib/itemQueries';
import type { DiscardExpiredRequest } from '@features/Kitchen/types';

/**
 * Discards every expired lot (optionally within a location subtree) in one go,
 * recording a Discarded movement per lot. Returns the number discarded and
 * refreshes inventory, history and the kitchen/expiration views.
 */
export function useDiscardExpired() {
  const queryClient = useQueryClient();

  return useMutation<number, unknown, DiscardExpiredRequest>({
    mutationFn: (body) => kitchenApi.discardExpired(body),
    onSuccess: () => invalidateItemData(queryClient),
  });
}

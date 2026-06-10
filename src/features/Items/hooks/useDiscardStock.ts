import { useMutation, useQueryClient } from '@tanstack/react-query';
import { itemsApi } from '@features/Items/api/itemsApi';
import { invalidateItemData } from '@features/Items/lib/itemQueries';
import type { DiscardStockRequest } from '@features/Items/types';

interface DiscardStockVariables {
  lotId: string;
  /** The owning item, so its detail/list totals can be refreshed. */
  itemId: string;
  payload: DiscardStockRequest;
}

/**
 * Discards part (or all) of a stock lot, logging a movement. Refreshes the
 * item, every location's contents and the movement history.
 */
export function useDiscardStock() {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, DiscardStockVariables>({
    mutationFn: ({ lotId, payload }) => itemsApi.discardStock(lotId, payload),
    onSuccess: (_data, { itemId }) => invalidateItemData(queryClient, itemId),
  });
}

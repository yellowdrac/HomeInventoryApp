import { useMutation, useQueryClient } from '@tanstack/react-query';
import { itemsApi } from '@features/Items/api/itemsApi';
import { invalidateItemData } from '@features/Items/lib/itemQueries';
import type { ConsumeStockRequest } from '@features/Items/types';

interface ConsumeStockVariables {
  lotId: string;
  /** The owning item, so its detail/list totals can be refreshed. */
  itemId: string;
  payload: ConsumeStockRequest;
}

/**
 * Consumes part (or all) of a stock lot, logging a movement. Refreshes the
 * item, every location's contents and the movement history.
 */
export function useConsumeStock() {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, ConsumeStockVariables>({
    mutationFn: ({ lotId, payload }) => itemsApi.consumeStock(lotId, payload),
    onSuccess: (_data, { itemId }) => invalidateItemData(queryClient, itemId),
  });
}

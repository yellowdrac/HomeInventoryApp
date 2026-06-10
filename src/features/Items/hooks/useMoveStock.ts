import { useMutation, useQueryClient } from '@tanstack/react-query';
import { itemsApi } from '@features/Items/api/itemsApi';
import { invalidateItemData } from '@features/Items/lib/itemQueries';
import type { MoveStockRequest, StockLot } from '@features/Items/types';

interface MoveStockVariables {
  lotId: string;
  /** The owning item, so its detail/list totals can be refreshed. */
  itemId: string;
  payload: MoveStockRequest;
}

/**
 * Moves part (or all) of a stock lot to another location, logging a movement.
 * Refreshes the item, every location's contents and the movement history.
 */
export function useMoveStock() {
  const queryClient = useQueryClient();

  return useMutation<StockLot, unknown, MoveStockVariables>({
    mutationFn: ({ lotId, payload }) => itemsApi.moveStock(lotId, payload),
    onSuccess: (_data, { itemId }) => invalidateItemData(queryClient, itemId),
  });
}

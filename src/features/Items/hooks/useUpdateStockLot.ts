import { useMutation, useQueryClient } from '@tanstack/react-query';
import { itemsApi } from '@features/Items/api/itemsApi';
import { invalidateItemData } from '@features/Items/lib/itemQueries';
import type { StockLot, UpdateStockLotRequest } from '@features/Items/types';

interface UpdateStockLotVariables {
  lotId: string;
  /** The owning item, so its detail/list totals can be refreshed. */
  itemId: string;
  payload: UpdateStockLotRequest;
}

/** Updates a stock lot's quantity/dates and refreshes the affected queries. */
export function useUpdateStockLot() {
  const queryClient = useQueryClient();

  return useMutation<StockLot, unknown, UpdateStockLotVariables>({
    mutationFn: ({ lotId, payload }) => itemsApi.updateStockLot(lotId, payload),
    onSuccess: (_data, { itemId }) => invalidateItemData(queryClient, itemId),
  });
}

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { itemsApi } from '@features/Items/api/itemsApi';
import { invalidateItemData } from '@features/Items/lib/itemQueries';
import type { AddStockRequest, StockLot } from '@features/Items/types';

interface AddStockVariables {
  itemId: string;
  payload: AddStockRequest;
}

/** Adds a stock lot to an item and refreshes the affected queries. */
export function useAddStock() {
  const queryClient = useQueryClient();

  return useMutation<StockLot, unknown, AddStockVariables>({
    mutationFn: ({ itemId, payload }) => itemsApi.addStock(itemId, payload),
    onSuccess: (_data, { itemId }) => invalidateItemData(queryClient, itemId),
  });
}

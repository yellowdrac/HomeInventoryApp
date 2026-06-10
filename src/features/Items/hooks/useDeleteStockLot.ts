import { useMutation, useQueryClient } from '@tanstack/react-query';
import { itemsApi } from '@features/Items/api/itemsApi';
import { invalidateItemData } from '@features/Items/lib/itemQueries';

interface DeleteStockLotVariables {
  lotId: string;
  /** The owning item, so its detail/list totals can be refreshed. */
  itemId: string;
}

/** Deletes a stock lot and refreshes the affected queries. */
export function useDeleteStockLot() {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, DeleteStockLotVariables>({
    mutationFn: ({ lotId }) => itemsApi.deleteStockLot(lotId),
    onSuccess: (_data, { itemId }) => invalidateItemData(queryClient, itemId),
  });
}

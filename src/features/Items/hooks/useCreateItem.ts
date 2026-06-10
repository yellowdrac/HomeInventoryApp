import { useMutation, useQueryClient } from '@tanstack/react-query';
import { itemsApi } from '@features/Items/api/itemsApi';
import { invalidateItemData } from '@features/Items/lib/itemQueries';
import type { CreateItemRequest, Item } from '@features/Items/types';

/** Creates an item and refreshes the items list. */
export function useCreateItem() {
  const queryClient = useQueryClient();

  return useMutation<Item, unknown, CreateItemRequest>({
    mutationFn: (payload) => itemsApi.create(payload),
    onSuccess: () => invalidateItemData(queryClient),
  });
}

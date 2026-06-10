import { useMutation, useQueryClient } from '@tanstack/react-query';
import { itemsApi } from '@features/Items/api/itemsApi';
import { invalidateItemData } from '@features/Items/lib/itemQueries';
import type { Item, UpdateItemRequest } from '@features/Items/types';

interface UpdateItemVariables {
  id: string;
  payload: UpdateItemRequest;
}

/** Updates an item and refreshes the list plus that item's detail. */
export function useUpdateItem() {
  const queryClient = useQueryClient();

  return useMutation<Item, unknown, UpdateItemVariables>({
    mutationFn: ({ id, payload }) => itemsApi.update(id, payload),
    onSuccess: (_data, { id }) => invalidateItemData(queryClient, id),
  });
}

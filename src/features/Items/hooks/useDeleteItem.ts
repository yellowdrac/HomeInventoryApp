import { useMutation, useQueryClient } from '@tanstack/react-query';
import { itemsApi } from '@features/Items/api/itemsApi';
import { invalidateItemData } from '@features/Items/lib/itemQueries';

/** Deletes an item and refreshes the items list. */
export function useDeleteItem() {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, string>({
    mutationFn: (id) => itemsApi.remove(id),
    onSuccess: () => invalidateItemData(queryClient),
  });
}

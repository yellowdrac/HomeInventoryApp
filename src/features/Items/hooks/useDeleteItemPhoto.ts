import { useMutation, useQueryClient } from '@tanstack/react-query';
import { itemsApi } from '@features/Items/api/itemsApi';
import { invalidateItemData } from '@features/Items/lib/itemQueries';

/**
 * Removes an item's photo via the backend endpoint. On success it invalidates
 * the item's detail and the items list so they re-render with the placeholder.
 */
export function useDeleteItemPhoto(itemId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, void>({
    mutationFn: () => itemsApi.deletePhoto(itemId),
    onSuccess: () => invalidateItemData(queryClient, itemId),
  });
}

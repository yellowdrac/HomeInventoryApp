import { useMutation, useQueryClient } from '@tanstack/react-query';
import { itemsApi } from '@features/Items/api/itemsApi';
import { invalidateItemData } from '@features/Items/lib/itemQueries';
import type { ItemPhoto } from '@features/Items/types';

/**
 * Uploads (or replaces) an item's photo via the backend multipart endpoint.
 * On success it invalidates the item's detail and the items list so the next
 * read fetches a fresh presigned URL (the previous one expires).
 */
export function useUploadItemPhoto(itemId: string) {
  const queryClient = useQueryClient();

  return useMutation<ItemPhoto, unknown, File>({
    mutationFn: (file) => itemsApi.uploadPhoto(itemId, file),
    onSuccess: () => invalidateItemData(queryClient, itemId),
  });
}

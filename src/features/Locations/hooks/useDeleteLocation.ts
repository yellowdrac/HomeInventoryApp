import { useMutation, useQueryClient } from '@tanstack/react-query';
import { locationsApi } from '@features/Locations/api/locationsApi';
import { locationTreeQueryKey } from '@features/Locations/hooks/useLocationTree';

/**
 * Deletes a location and refreshes the tree. The backend rejects deleting a
 * location that still has children or stock; the caller surfaces that error.
 */
export function useDeleteLocation() {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, string>({
    mutationFn: (id) => locationsApi.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: locationTreeQueryKey });
    },
  });
}

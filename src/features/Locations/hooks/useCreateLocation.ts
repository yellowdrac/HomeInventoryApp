import { useMutation, useQueryClient } from '@tanstack/react-query';
import { locationsApi } from '@features/Locations/api/locationsApi';
import { locationTreeQueryKey } from '@features/Locations/hooks/useLocationTree';
import type {
  CreateLocationRequest,
  LocationDetail,
} from '@features/Locations/types';

/** Creates a location (root or child) and refreshes the tree. */
export function useCreateLocation() {
  const queryClient = useQueryClient();

  return useMutation<LocationDetail, unknown, CreateLocationRequest>({
    mutationFn: (payload) => locationsApi.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: locationTreeQueryKey });
    },
  });
}

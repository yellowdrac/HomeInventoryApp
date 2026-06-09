import { useMutation, useQueryClient } from '@tanstack/react-query';
import { locationsApi } from '@features/Locations/api/locationsApi';
import { locationTreeQueryKey } from '@features/Locations/hooks/useLocationTree';
import { locationDetailQueryKey } from '@features/Locations/hooks/useLocation';
import type {
  LocationDetail,
  UpdateLocationRequest,
} from '@features/Locations/types';

interface UpdateLocationVariables {
  id: string;
  payload: UpdateLocationRequest;
}

/** Renames/retypes a location and refreshes the tree and its detail. */
export function useUpdateLocation() {
  const queryClient = useQueryClient();

  return useMutation<LocationDetail, unknown, UpdateLocationVariables>({
    mutationFn: ({ id, payload }) => locationsApi.update(id, payload),
    onSuccess: (_data, { id }) => {
      void queryClient.invalidateQueries({ queryKey: locationTreeQueryKey });
      void queryClient.invalidateQueries({
        queryKey: locationDetailQueryKey(id),
      });
    },
  });
}

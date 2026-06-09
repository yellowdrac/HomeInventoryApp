import { useMutation, useQueryClient } from '@tanstack/react-query';
import { locationsApi } from '@features/Locations/api/locationsApi';
import { locationTreeQueryKey } from '@features/Locations/hooks/useLocationTree';
import type {
  LocationDetail,
  MoveLocationRequest,
} from '@features/Locations/types';

interface MoveLocationVariables {
  id: string;
  payload: MoveLocationRequest;
}

/** Moves a location under a new parent (or to the root) and refreshes the tree. */
export function useMoveLocation() {
  const queryClient = useQueryClient();

  return useMutation<LocationDetail, unknown, MoveLocationVariables>({
    mutationFn: ({ id, payload }) => locationsApi.move(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: locationTreeQueryKey });
    },
  });
}

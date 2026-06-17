import { useMutation, useQueryClient } from '@tanstack/react-query';
import { assistantApi } from '@features/Assistant/api/assistantApi';
import { invalidateItemData } from '@features/Items/lib/itemQueries';
import type { ExecuteActionRequest, ExecuteActionResult } from '@features/Assistant/types';

/**
 * Sends confirmed proposed actions to `/api/assistant/execute`, then invalidates
 * all inventory queries so the UI reflects the newly created entities.
 */
export function useExecuteAssistantAction() {
  const queryClient = useQueryClient();

  return useMutation<ExecuteActionResult, unknown, ExecuteActionRequest>({
    mutationFn: (payload) => assistantApi.execute(payload),
    onSuccess: () => {
      // Reuse the existing invalidation helper that covers items, location contents,
      // movements and expirations.
      invalidateItemData(queryClient);
      // Also invalidate the location tree (new locations may have been created).
      void queryClient.invalidateQueries({ queryKey: ['locations', 'tree'] });
    },
  });
}

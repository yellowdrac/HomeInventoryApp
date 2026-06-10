import { apiClient } from '@/core/api/client';
import type { GetMovementsParams, MovementsPage } from '@features/Movements/types';

/**
 * Typed wrapper around the `/api/movements` endpoint. Scoped to the caller's
 * household on the backend via the `householdId` token claim.
 */
export const movementsApi = {
  async list(params: GetMovementsParams = {}): Promise<MovementsPage> {
    const { data } = await apiClient.get<MovementsPage>('/api/movements', {
      params,
    });
    return data;
  },
};

import { apiClient } from '@/core/api/client';
import type { SearchPage, SearchParams } from '@features/Search/types';

/**
 * Typed wrapper around the `/api/search` endpoint. Scoped to the caller's
 * household on the backend via the `householdId` token claim.
 */
export const searchApi = {
  async search(params: SearchParams): Promise<SearchPage> {
    const { data } = await apiClient.get<SearchPage>('/api/search', { params });
    return data;
  },
};

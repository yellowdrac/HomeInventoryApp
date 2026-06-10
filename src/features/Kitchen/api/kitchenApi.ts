import { apiClient } from '@/core/api/client';
import type {
  DiscardExpiredRequest,
  ExpiringLot,
  GetExpiringStockParams,
  KitchenOverview,
  KitchenOverviewParams,
} from '@features/Kitchen/types';

/**
 * Typed wrappers around the expiration/kitchen endpoints. Every call is scoped
 * to the caller's household on the backend via the `householdId` token claim.
 */
export const kitchenApi = {
  async getExpiringStock(
    params: GetExpiringStockParams = {},
  ): Promise<ExpiringLot[]> {
    const { data } = await apiClient.get<ExpiringLot[]>('/api/expirations', {
      params,
    });
    return data;
  },

  async getOverview(
    params: KitchenOverviewParams = {},
  ): Promise<KitchenOverview> {
    const { data } = await apiClient.get<KitchenOverview>(
      '/api/kitchen/overview',
      { params },
    );
    return data;
  },

  async discardExpired(body: DiscardExpiredRequest = {}): Promise<number> {
    const { data } = await apiClient.post<number>(
      '/api/expirations/discard-expired',
      body,
    );
    return data;
  },
};

import { apiClient } from '@/core/api/client';
import type {
  AddStockRequest,
  CreateItemRequest,
  GetItemsParams,
  Item,
  ItemDetail,
  PagedResult,
  StockLot,
  UpdateItemRequest,
  UpdateStockLotRequest,
} from '@features/Items/types';

/**
 * Typed wrappers around the item and stock endpoints. Every call is scoped to
 * the caller's household on the backend via the `householdId` token claim.
 */
export const itemsApi = {
  async list(params: GetItemsParams = {}): Promise<PagedResult<Item>> {
    const { data } = await apiClient.get<PagedResult<Item>>('/api/items', {
      params,
    });
    return data;
  },

  async getById(id: string): Promise<ItemDetail> {
    const { data } = await apiClient.get<ItemDetail>(`/api/items/${id}`);
    return data;
  },

  async create(payload: CreateItemRequest): Promise<Item> {
    const { data } = await apiClient.post<Item>('/api/items', payload);
    return data;
  },

  async update(id: string, payload: UpdateItemRequest): Promise<Item> {
    const { data } = await apiClient.put<Item>(`/api/items/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/api/items/${id}`);
  },

  async addStock(itemId: string, payload: AddStockRequest): Promise<StockLot> {
    const { data } = await apiClient.post<StockLot>(
      `/api/items/${itemId}/stock`,
      payload,
    );
    return data;
  },

  async updateStockLot(
    lotId: string,
    payload: UpdateStockLotRequest,
  ): Promise<StockLot> {
    const { data } = await apiClient.put<StockLot>(
      `/api/stock-lots/${lotId}`,
      payload,
    );
    return data;
  },

  async deleteStockLot(lotId: string): Promise<void> {
    await apiClient.delete(`/api/stock-lots/${lotId}`);
  },
};

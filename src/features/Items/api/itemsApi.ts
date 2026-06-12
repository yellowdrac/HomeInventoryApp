import type { AxiosRequestHeaders } from 'axios';
import { apiClient } from '@/core/api/client';
import type {
  AddStockRequest,
  ConsumeStockRequest,
  CreateItemRequest,
  DiscardStockRequest,
  GetItemsParams,
  Item,
  ItemDetail,
  ItemPhoto,
  MoveStockRequest,
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

  async uploadPhoto(itemId: string, file: File): Promise<ItemPhoto> {
    const formData = new FormData();
    // Field name must match the backend `IFormFile file` parameter.
    formData.append('file', file);
    const { data } = await apiClient.post<ItemPhoto>(
      `/api/items/${itemId}/photo`,
      formData,
      {
        // Clear the client's default JSON content type so axios lets the browser
        // set `multipart/form-data` with the correct boundary. Cast because
        // `exactOptionalPropertyTypes` rejects an explicit `undefined` value.
        headers: { 'Content-Type': undefined } as unknown as AxiosRequestHeaders,
      },
    );
    return data;
  },

  async deletePhoto(itemId: string): Promise<void> {
    await apiClient.delete(`/api/items/${itemId}/photo`);
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

  async moveStock(lotId: string, payload: MoveStockRequest): Promise<StockLot> {
    const { data } = await apiClient.post<StockLot>(
      `/api/stock-lots/${lotId}/move`,
      payload,
    );
    return data;
  },

  async consumeStock(
    lotId: string,
    payload: ConsumeStockRequest,
  ): Promise<void> {
    await apiClient.post(`/api/stock-lots/${lotId}/consume`, payload);
  },

  async discardStock(
    lotId: string,
    payload: DiscardStockRequest,
  ): Promise<void> {
    await apiClient.post(`/api/stock-lots/${lotId}/discard`, payload);
  },
};

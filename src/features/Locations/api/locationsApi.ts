import { apiClient } from '@/core/api/client';
import type {
  CreateLocationRequest,
  LocationDetail,
  LocationTreeNode,
  MoveLocationRequest,
  UpdateLocationRequest,
} from '@features/Locations/types';

/**
 * Typed wrappers around the `/api/locations` endpoints. Every call is scoped to
 * the caller's household on the backend via the `householdId` token claim.
 */
export const locationsApi = {
  async getTree(): Promise<LocationTreeNode[]> {
    const { data } =
      await apiClient.get<LocationTreeNode[]>('/api/locations/tree');
    return data;
  },

  async getById(id: string): Promise<LocationDetail> {
    const { data } = await apiClient.get<LocationDetail>(
      `/api/locations/${id}`,
    );
    return data;
  },

  async create(payload: CreateLocationRequest): Promise<LocationDetail> {
    const { data } = await apiClient.post<LocationDetail>(
      '/api/locations',
      payload,
    );
    return data;
  },

  async update(
    id: string,
    payload: UpdateLocationRequest,
  ): Promise<LocationDetail> {
    const { data } = await apiClient.put<LocationDetail>(
      `/api/locations/${id}`,
      payload,
    );
    return data;
  },

  async move(id: string, payload: MoveLocationRequest): Promise<LocationDetail> {
    const { data } = await apiClient.post<LocationDetail>(
      `/api/locations/${id}/move`,
      payload,
    );
    return data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/api/locations/${id}`);
  },
};

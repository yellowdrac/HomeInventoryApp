import { apiClient } from '@/core/api/client';
import type { StockLot } from '@features/Items/types';
import type {
  CreateLocationRequest,
  LocationBySlug,
  LocationDetail,
  LocationTreeNode,
  MoveLocationRequest,
  PrintableLocation,
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

  async getContents(id: string): Promise<StockLot[]> {
    const { data } = await apiClient.get<StockLot[]>(
      `/api/locations/${id}/contents`,
    );
    return data;
  },

  /** Resolves a QR slug to a location (and its contents) within the household. */
  async getBySlug(slug: string): Promise<LocationBySlug> {
    const { data } = await apiClient.get<LocationBySlug>(
      `/api/locations/by-slug/${encodeURIComponent(slug)}`,
    );
    return data;
  },

  /**
   * Lists the household's locations as printable QR labels. When `locationId`
   * is given, the list is scoped to that location and all of its descendants.
   */
  async getPrintable(locationId?: string): Promise<PrintableLocation[]> {
    const { data } = await apiClient.get<PrintableLocation[]>(
      '/api/locations/printable',
      locationId ? { params: { locationId } } : undefined,
    );
    return data;
  },
};

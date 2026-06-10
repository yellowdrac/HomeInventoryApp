/**
 * Request/response DTOs for the Search feature, mirroring the backend contract
 * under `/api/search` ("where is my item?").
 */

import type { PagedResult, TrackingType } from '@features/Items/types';
import type { LocationType } from '@features/Locations/types';

/**
 * One entry of a placement breadcrumb (root first, the location itself last).
 * Mirrors the backend `LocationDto`.
 */
export interface SearchBreadcrumbItem {
  id: string;
  name: string;
  type: LocationType;
  parentId: string | null;
  qrSlug: string;
}

/** One place a matched item is stored (derived from a stock lot). */
export interface SearchPlacement {
  locationId: string;
  locationName: string;
  /** Names from the root down to the storing location, inclusive. */
  breadcrumb: SearchBreadcrumbItem[];
  quantity: number;
  /** ISO date (`yyyy-mm-dd`) or null. */
  expirationDate: string | null;
}

/** A single search hit: the matched item plus everywhere it is stored. */
export interface SearchResultItem {
  itemId: string;
  name: string;
  category: string | null;
  trackingType: TrackingType;
  unit: string | null;
  totalQuantity: number;
  placements: SearchPlacement[];
}

/** Query parameters accepted by `GET /api/search`. */
export interface SearchParams {
  q: string;
  category?: string;
  page?: number;
  pageSize?: number;
}

export type SearchPage = PagedResult<SearchResultItem>;

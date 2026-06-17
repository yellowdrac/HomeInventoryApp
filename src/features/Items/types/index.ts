/**
 * Request/response DTOs for the Items feature, mirroring the backend contract
 * under `/api/items`, `/api/stock-lots` and `/api/locations/{id}/contents`.
 */

/**
 * Tracking strategy for an item. Mirrors the backend `TrackingType` enum
 * (HomeInventory.Domain.Enums.TrackingType). Values match the C# declaration
 * order, which is how System.Text.Json serializes the enum by default.
 */
export const TrackingType = {
  Unique: 0,
  Quantity: 1,
} as const;

export type TrackingType = (typeof TrackingType)[keyof typeof TrackingType];

/** All enum values in display order; handy for selects and validation. */
export const TRACKING_TYPE_VALUES = [
  TrackingType.Unique,
  TrackingType.Quantity,
] as const;

/** Human-readable labels for each tracking type. */
export const TRACKING_TYPE_LABELS: Record<TrackingType, string> = {
  [TrackingType.Unique]: 'Unique',
  [TrackingType.Quantity]: 'Quantity',
};

/** A single stock lot of an item, enriched with its location breadcrumb. */
export interface StockLot {
  id: string;
  itemId: string;
  itemName: string;
  locationId: string;
  locationName: string;
  /** Names from the root down to the storing location. */
  locationBreadcrumb: string[];
  quantity: number;
  /** ISO date (`yyyy-mm-dd`) or null. */
  expirationDate: string | null;
  /** ISO date (`yyyy-mm-dd`) or null. */
  acquiredDate: string | null;
}

/** List read model of an item, with its total quantity across all lots. */
export interface Item {
  id: string;
  name: string;
  category: string | null;
  barcode: string | null;
  trackingType: TrackingType;
  unit: string | null;
  photoUrl: string | null;
  totalQuantity: number;
  /** Alert threshold: dashboard flags this item when total quantity drops below this. Null means no threshold. */
  minimumQuantity: number | null;
}

/** Detailed read model of an item: its fields plus every stock lot it owns. */
export interface ItemDetail extends Item {
  lots: StockLot[];
}

/**
 * Result of uploading an item photo: a fresh, short-lived presigned GET URL for
 * the stored object (mirrors the backend `ItemPhotoDto`).
 */
export interface ItemPhoto {
  photoUrl: string;
}

/** A single page of results plus pagination metadata (mirrors `PagedResult<T>`). */
export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

/** Query parameters accepted by `GET /api/items`. */
export interface GetItemsParams {
  nameFilter?: string;
  category?: string;
  page?: number;
  pageSize?: number;
  /** When true, only return items whose total quantity is below their minimumQuantity threshold. */
  belowMinimum?: boolean;
}

export interface CreateItemRequest {
  name: string;
  category: string | null;
  barcode: string | null;
  trackingType: TrackingType;
  unit: string | null;
  photoUrl: string | null;
  minimumQuantity: number | null;
}

export type UpdateItemRequest = CreateItemRequest;

export interface AddStockRequest {
  locationId: string;
  quantity: number;
  /** ISO date (`yyyy-mm-dd`) or null. */
  expirationDate: string | null;
  /** ISO date (`yyyy-mm-dd`) or null. */
  acquiredDate: string | null;
}

export interface UpdateStockLotRequest {
  quantity: number;
  expirationDate: string | null;
  acquiredDate: string | null;
}

/** Body of `POST /api/stock-lots/{id}/move`. */
export interface MoveStockRequest {
  toLocationId: string;
  quantity: number;
}

/** Body of `POST /api/stock-lots/{id}/consume`. */
export interface ConsumeStockRequest {
  quantity: number;
  reason: string | null;
}

/** Body of `POST /api/stock-lots/{id}/discard`. */
export interface DiscardStockRequest {
  quantity: number;
  reason: string | null;
}

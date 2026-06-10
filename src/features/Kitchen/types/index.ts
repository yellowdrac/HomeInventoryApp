/**
 * Request/response DTOs for the Kitchen feature, mirroring the backend contract
 * under `/api/expirations` and `/api/kitchen`. "Kitchen" is not a separate
 * entity: it is the view over every stock lot that has an expiration date.
 */

import type { SearchBreadcrumbItem } from '@features/Search/types';

/**
 * Expiry state of a stock lot relative to "today" and the warning window.
 * Mirrors the backend `ExpirationStatus` enum; values match the C# declaration
 * order, which is how System.Text.Json serializes the enum by default.
 */
export const ExpirationStatus = {
  Expired: 0,
  ExpiringSoon: 1,
  Ok: 2,
} as const;

export type ExpirationStatus =
  (typeof ExpirationStatus)[keyof typeof ExpirationStatus];

/** Human-readable labels for each expiration status. */
export const EXPIRATION_STATUS_LABELS: Record<ExpirationStatus, string> = {
  [ExpirationStatus.Expired]: 'Expired',
  [ExpirationStatus.ExpiringSoon]: 'Expiring soon',
  [ExpirationStatus.Ok]: 'Ok',
};

/**
 * A perishable stock lot (one with an expiration date) surfaced by the
 * expiration views, enriched with its item, location breadcrumb, days until
 * expiry and status. The breadcrumb mirrors the backend `LocationDto`.
 */
export interface ExpiringLot {
  stockLotId: string;
  itemId: string;
  itemName: string;
  locationId: string;
  locationName: string;
  /** Names from the root down to the storing location, inclusive. */
  breadcrumb: SearchBreadcrumbItem[];
  quantity: number;
  /** ISO date (`yyyy-mm-dd`). */
  expirationDate: string;
  /** Whole days until expiry; negative when already expired. */
  daysUntilExpiry: number;
  status: ExpirationStatus;
}

/** Dashboard summary of perishable stock (optionally scoped to a location). */
export interface KitchenOverview {
  expiredCount: number;
  expiringSoonCount: number;
  perishableLotCount: number;
  /** ISO date (`yyyy-mm-dd`) of the nearest upcoming expiry, or null. */
  soonestExpiration: string | null;
}

/** Query parameters accepted by `GET /api/expirations`. */
export interface GetExpiringStockParams {
  withinDays?: number;
  includeExpired?: boolean;
  locationId?: string;
  category?: string;
  /** The client's local "today" as `yyyy-mm-dd`. */
  asOfDate?: string;
}

/** Query parameters accepted by `GET /api/kitchen/overview`. */
export interface KitchenOverviewParams {
  locationId?: string;
  withinDays?: number;
  /** The client's local "today" as `yyyy-mm-dd`. */
  asOfDate?: string;
}

/** Body of `POST /api/expirations/discard-expired`. */
export interface DiscardExpiredRequest {
  locationId?: string;
  asOfDate?: string;
}

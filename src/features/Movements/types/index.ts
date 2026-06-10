/**
 * Request/response DTOs for the Movements feature, mirroring the backend
 * contract under `/api/movements`.
 */

import type { PagedResult } from '@features/Items/types';

/**
 * Nature of an inventory movement. Mirrors the backend `MovementType` enum
 * (HomeInventory.Domain.Enums.MovementType). Values match the C# declaration
 * order, which is how System.Text.Json serializes the enum by default.
 */
export const MovementType = {
  Created: 0,
  Moved: 1,
  Consumed: 2,
  Adjusted: 3,
  Discarded: 4,
} as const;

export type MovementType = (typeof MovementType)[keyof typeof MovementType];

/** All enum values in display order; handy for selects and filters. */
export const MOVEMENT_TYPE_VALUES = [
  MovementType.Created,
  MovementType.Moved,
  MovementType.Consumed,
  MovementType.Adjusted,
  MovementType.Discarded,
] as const;

/** Human-readable labels for each movement type. */
export const MOVEMENT_TYPE_LABELS: Record<MovementType, string> = {
  [MovementType.Created]: 'Created',
  [MovementType.Moved]: 'Moved',
  [MovementType.Consumed]: 'Consumed',
  [MovementType.Adjusted]: 'Adjusted',
  [MovementType.Discarded]: 'Discarded',
};

/** A single append-only movement (history entry), enriched for display. */
export interface Movement {
  id: string;
  itemId: string;
  itemName: string;
  fromLocationId: string | null;
  fromLocationName: string | null;
  toLocationId: string | null;
  toLocationName: string | null;
  quantity: number;
  type: MovementType;
  reason: string | null;
  performedByUserId: string;
  performedByDisplayName: string;
  /** ISO date-time string of when the movement occurred. */
  occurredAt: string;
}

/** Query parameters accepted by `GET /api/movements`. */
export interface GetMovementsParams {
  itemId?: string;
  locationId?: string;
  type?: MovementType;
  /** Inclusive lower bound as an ISO date-time string. */
  dateFrom?: string;
  /** Inclusive upper bound as an ISO date-time string. */
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

export type MovementsPage = PagedResult<Movement>;

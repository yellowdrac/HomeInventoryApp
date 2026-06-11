/**
 * Request/response DTOs for the Locations feature, mirroring the backend
 * contract under `/api/locations`.
 */

import type { StockLot } from '@features/Items/types';

/**
 * Hierarchical level of a location. Mirrors the backend `LocationType` enum
 * (HomeInventory.Domain.Enums.LocationType). Values match the C# declaration
 * order, which is how System.Text.Json serializes the enum by default.
 */
export const LocationType = {
  Zone: 0,
  Room: 1,
  Furniture: 2,
  Container: 3,
  Spot: 4,
} as const;

export type LocationType = (typeof LocationType)[keyof typeof LocationType];

/** All enum values in display order; handy for selects and validation. */
export const LOCATION_TYPE_VALUES = [
  LocationType.Zone,
  LocationType.Room,
  LocationType.Furniture,
  LocationType.Container,
  LocationType.Spot,
] as const;

/** Human-readable labels for each location type. */
export const LOCATION_TYPE_LABELS: Record<LocationType, string> = {
  [LocationType.Zone]: 'Zone',
  [LocationType.Room]: 'Room',
  [LocationType.Furniture]: 'Furniture',
  [LocationType.Container]: 'Container',
  [LocationType.Spot]: 'Spot',
};

/** A node in the location tree, with its nested children. */
export interface LocationTreeNode {
  id: string;
  name: string;
  type: LocationType;
  parentId: string | null;
  children: LocationTreeNode[];
}

/** One ancestor entry in a location's breadcrumb (root first, self last). */
export interface LocationBreadcrumbItem {
  id: string;
  name: string;
}

/** Flat read model of a single location node. */
export interface LocationNode {
  id: string;
  name: string;
  type: LocationType;
  parentId: string | null;
  qrSlug: string;
}

/** Detailed read model for a single location. */
export interface LocationDetail {
  id: string;
  name: string;
  type: LocationType;
  parentId: string | null;
  qrSlug: string;
  breadcrumb: LocationBreadcrumbItem[];
  /** Direct children of the location (root → node order not applicable). */
  children: LocationNode[];
}

/**
 * Result of resolving a location by its QR slug: the location detail plus the
 * stock lots stored at it. Mirrors the backend `LocationBySlugDto`.
 */
export interface LocationBySlug {
  detail: LocationDetail;
  contents: StockLot[];
}

/**
 * Flat read model used to build a printable sheet of QR labels: a location with
 * its name, its breadcrumb path (root → location, joined with ` / `) and the
 * slug encoded into the QR. Mirrors the backend `PrintableLocationDto`.
 */
export interface PrintableLocation {
  id: string;
  name: string;
  breadcrumb: string;
  qrSlug: string;
}

export interface CreateLocationRequest {
  name: string;
  type: LocationType;
  /** `null` creates a root location. */
  parentId: string | null;
}

export interface UpdateLocationRequest {
  name: string;
  type: LocationType;
}

export interface MoveLocationRequest {
  /** `null` moves the location to the top level. */
  newParentId: string | null;
}

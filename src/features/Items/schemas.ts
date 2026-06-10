import { z } from 'zod';
import { TRACKING_TYPE_VALUES, type TrackingType } from '@features/Items/types';

/**
 * Validation schema for the item create/edit form. Constraints mirror the
 * backend validators (name required, up to 200 chars; optional fields capped;
 * tracking type must be a known enum value).
 *
 * The `trackingType` field is kept as a string because native `<select>`
 * controls yield strings; callers convert it with {@link parseTrackingType}.
 */
export const itemFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(200, 'Name must be at most 200 characters'),
  category: z
    .string()
    .trim()
    .max(100, 'Category must be at most 100 characters'),
  barcode: z
    .string()
    .trim()
    .max(64, 'Barcode must be at most 64 characters'),
  trackingType: z
    .string()
    .refine(
      (value) =>
        (TRACKING_TYPE_VALUES as readonly number[]).includes(Number(value)),
      'Select a valid tracking type',
    ),
  unit: z.string().trim().max(32, 'Unit must be at most 32 characters'),
});

export type ItemFormValues = z.infer<typeof itemFormSchema>;

/** Converts a validated form `trackingType` string into the numeric enum. */
export function parseTrackingType(value: string): TrackingType {
  return Number(value) as TrackingType;
}

/** Shared validation for the quantity + optional dates of a stock lot. */
const quantitySchema = z
  .string()
  .trim()
  .min(1, 'Quantity is required')
  .refine((value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0;
  }, 'Quantity must be greater than 0');

// Native date inputs yield an empty string when cleared; treat that as "no date".
const optionalDateSchema = z.string();

/** Validation schema for the "add stock" form. */
export const addStockSchema = z.object({
  locationId: z.string().min(1, 'Select a location'),
  quantity: quantitySchema,
  expirationDate: optionalDateSchema,
  acquiredDate: optionalDateSchema,
});

export type AddStockFormValues = z.infer<typeof addStockSchema>;

/** Validation schema for editing an existing stock lot (no location change). */
export const stockLotSchema = z.object({
  quantity: quantitySchema,
  expirationDate: optionalDateSchema,
  acquiredDate: optionalDateSchema,
});

export type StockLotFormValues = z.infer<typeof stockLotSchema>;

/** Normalizes a date field: empty string becomes `null`, otherwise trimmed. */
export function toNullableDate(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/** Normalizes an optional text field: empty/blank becomes `null`. */
export function toNullableText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

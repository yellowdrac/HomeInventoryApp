import { z } from 'zod';
import { LOCATION_TYPE_VALUES, type LocationType } from '@features/Locations/types';

/**
 * Validation schema for the location forms. Constraints mirror the backend
 * validators (name required, up to 200 chars; type must be a known enum value).
 *
 * The `type` field is kept as a string because native `<select>` controls yield
 * strings; callers convert it with {@link parseLocationType} on submit.
 */
export const locationFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(200, 'Name must be at most 200 characters'),
  type: z
    .string()
    .refine(
      (value) =>
        (LOCATION_TYPE_VALUES as readonly number[]).includes(Number(value)),
      'Select a valid type',
    ),
});

export type LocationFormValues = z.infer<typeof locationFormSchema>;

/** Converts a validated form `type` string back into the numeric enum value. */
export function parseLocationType(value: string): LocationType {
  return Number(value) as LocationType;
}

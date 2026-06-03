import { z } from 'zod';

/**
 * Validation schemas for the household forms. Constraints mirror the backend
 * validators (name up to 200 chars, join code exactly 8 chars).
 */

export const createHouseholdSchema = z.object({
  name: z
    .string()
    .min(1, 'Household name is required')
    .max(200, 'Name must be at most 200 characters'),
});

export const joinHouseholdSchema = z.object({
  joinCode: z
    .string()
    .min(1, 'Join code is required')
    .length(8, 'Join code must be exactly 8 characters'),
});

export type CreateHouseholdFormValues = z.infer<typeof createHouseholdSchema>;
export type JoinHouseholdFormValues = z.infer<typeof joinHouseholdSchema>;

import { resolveApiErrorMessage } from '@/core/api/errors';

/**
 * Friendly messages keyed by the backend household error code
 * (ProblemDetails `title`). See backend HouseholdErrors.
 */
const MESSAGE_BY_CODE: Record<string, string> = {
  'Household.AlreadyInHousehold': 'You already belong to a household.',
  'Household.InvalidJoinCode':
    'That join code did not match any household. Double-check it and try again.',
  'Household.NoHousehold': 'You do not belong to a household yet.',
  'Household.NotOwner': 'Only the household owner can perform this action.',
  'Household.UserNotFound':
    'We could not find your account. Please sign in again.',
};

/** Maps a household error into a specific, user-facing message. */
export function getHouseholdErrorMessage(error: unknown): string {
  return resolveApiErrorMessage(error, MESSAGE_BY_CODE);
}

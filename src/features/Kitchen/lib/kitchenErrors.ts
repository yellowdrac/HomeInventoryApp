import { resolveApiErrorMessage } from '@/core/api/errors';

/** Maps a kitchen/expiration error into a user-facing message. */
export function getKitchenErrorMessage(error: unknown): string {
  return resolveApiErrorMessage(error);
}

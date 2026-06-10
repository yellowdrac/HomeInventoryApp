import { resolveApiErrorMessage } from '@/core/api/errors';

/** Maps a movements error into a user-facing message. */
export function getMovementErrorMessage(error: unknown): string {
  return resolveApiErrorMessage(error);
}

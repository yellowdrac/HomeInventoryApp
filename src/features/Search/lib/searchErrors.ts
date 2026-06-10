import { resolveApiErrorMessage } from '@/core/api/errors';

/** Maps a search error into a user-facing message. */
export function getSearchErrorMessage(error: unknown): string {
  return resolveApiErrorMessage(error);
}

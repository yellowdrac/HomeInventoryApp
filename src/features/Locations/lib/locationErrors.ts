import { resolveApiErrorMessage } from '@/core/api/errors';

/**
 * Friendly messages keyed by the backend location error code
 * (ProblemDetails `title`). See the backend LocationErrors.
 */
const MESSAGE_BY_CODE: Record<string, string> = {
  'Location.NotFound': 'That location no longer exists. Refresh and try again.',
  'Location.HasChildren':
    'This location has nested locations. Move or delete them first.',
  'Location.HasStock':
    'This location still holds items. Move or remove them before deleting it.',
  'Location.InvalidParent':
    'That destination is not a valid parent for this location.',
  'Location.CircularReference':
    'A location cannot be moved inside itself or one of its descendants.',
  'Location.DuplicateName':
    'A location with that name already exists at this level.',
};

/** Maps a location error into a specific, user-facing message. */
export function getLocationErrorMessage(error: unknown): string {
  return resolveApiErrorMessage(error, MESSAGE_BY_CODE);
}

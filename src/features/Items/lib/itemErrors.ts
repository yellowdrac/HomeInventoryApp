import { resolveApiErrorMessage } from '@/core/api/errors';

/**
 * Friendly messages keyed by the backend item/stock error code
 * (ProblemDetails `title`). See the backend ItemErrors and StockErrors.
 */
const MESSAGE_BY_CODE: Record<string, string> = {
  'Item.NotFound': 'That item no longer exists. Refresh and try again.',
  'Item.DuplicateName':
    'An item with that name already exists in your household.',
  'Item.HasStock':
    'This item still has stock. Remove its stock lots before deleting it.',
  'Item.PhotoContentTypeNotAllowed':
    'That image type is not supported. Use JPEG, PNG or WebP.',
  'Item.PhotoTooLarge': 'That image is too large. The maximum size is 5 MB.',
  'Stock.LotNotFound':
    'That stock lot no longer exists. Refresh and try again.',
  'Stock.ItemNotFound': 'The referenced item no longer exists.',
  'Stock.LocationNotFound': 'The selected location no longer exists.',
  'Stock.UniqueAlreadyStocked':
    'A unique-tracked item can only have a single stock lot.',
  'Stock.InsufficientQuantity':
    'That is more than the quantity available in this lot.',
  'Stock.SameLocation':
    'Pick a destination different from the current location.',
  'Stock.UniqueMustMoveWholeLot':
    'A unique-tracked item must be moved as a whole lot.',
};

/** Maps an item or stock error into a specific, user-facing message. */
export function getItemErrorMessage(error: unknown): string {
  return resolveApiErrorMessage(error, MESSAGE_BY_CODE);
}

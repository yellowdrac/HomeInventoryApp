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
  'Stock.LotNotFound':
    'That stock lot no longer exists. Refresh and try again.',
  'Stock.ItemNotFound': 'The referenced item no longer exists.',
  'Stock.LocationNotFound': 'The selected location no longer exists.',
  'Stock.UniqueAlreadyStocked':
    'A unique-tracked item can only have a single stock lot.',
};

/** Maps an item or stock error into a specific, user-facing message. */
export function getItemErrorMessage(error: unknown): string {
  return resolveApiErrorMessage(error, MESSAGE_BY_CODE);
}

import type { QueryClient } from '@tanstack/react-query';

/**
 * Invalidates every query whose data depends on an item or its stock, keeping
 * the cache consistent after a create/update/delete or a stock change.
 *
 * Centralized on purpose: stock mutations all funnel their cache effects
 * through here. Phase 4 stock actions (move/consume/discard) also write a
 * movement, so the movement history is invalidated here too, and Phase 6's
 * expiration/kitchen views are derived from the same lots.
 */
export function invalidateItemData(
  queryClient: QueryClient,
  itemId?: string,
): void {
  // The items list (totals change with stock) and any item detail.
  void queryClient.invalidateQueries({ queryKey: ['items'] });
  if (itemId) {
    void queryClient.invalidateQueries({
      queryKey: ['items', 'detail', itemId],
    });
  }
  // Location contents listings reflect stock placement.
  void queryClient.invalidateQueries({ queryKey: ['locations', 'contents'] });
  // The movement history grows with every stock change.
  void queryClient.invalidateQueries({ queryKey: ['movements'] });
  // The expiration list and kitchen overview are derived from perishable lots.
  void queryClient.invalidateQueries({ queryKey: ['expirations'] });
  void queryClient.invalidateQueries({ queryKey: ['kitchen'] });
}

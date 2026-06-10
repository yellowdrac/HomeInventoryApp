import type { QueryClient } from '@tanstack/react-query';

/**
 * Invalidates every query whose data depends on an item or its stock, keeping
 * the cache consistent after a create/update/delete or a stock change.
 *
 * Centralized on purpose: stock mutations all funnel their cache effects
 * through here, so Phase 4 (movement history) can extend the invalidation set
 * in one place instead of touching each hook.
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
}

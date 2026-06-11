import { useItems } from '@features/Items/hooks/useItems';
import { useLocationTree } from '@features/Locations/hooks/useLocationTree';
import { useKitchenOverview } from '@features/Kitchen/hooks/useKitchenOverview';
import { useMovements } from '@features/Movements/hooks/useMovements';
import type { LocationTreeNode } from '@features/Locations/types';
import type { Movement } from '@features/Movements/types';

/** Number of most-recent movements surfaced on the dashboard. */
const RECENT_MOVEMENTS_COUNT = 5;
/** Warning window (in days) used for the "expiring soon" summary card. */
const EXPIRING_WINDOW_DAYS = 7;

/** Counts every node in the location tree, including nested children. */
function countLocations(nodes: LocationTreeNode[]): number {
  return nodes.reduce(
    (total, node) => total + 1 + countLocations(node.children),
    0,
  );
}

/** Headline figures shown across the dashboard summary cards. */
export interface DashboardSummary {
  itemCount: number;
  locationCount: number;
  expiringSoonCount: number;
  expiredCount: number;
}

/**
 * Aggregates the read models the dashboard needs into a single hook: the
 * household-wide counts (items, locations, perishables) and the most recent
 * movements. Each underlying query is already cached and reused elsewhere, so
 * navigating here is cheap. Counts default to 0 while their query is pending so
 * the cards can render without flashing undefined.
 */
export function useDashboard() {
  const itemsQuery = useItems({ page: 1, pageSize: 1 });
  const locationsQuery = useLocationTree();
  const kitchenQuery = useKitchenOverview({ withinDays: EXPIRING_WINDOW_DAYS });
  const movementsQuery = useMovements({
    page: 1,
    pageSize: RECENT_MOVEMENTS_COUNT,
  });

  const summary: DashboardSummary = {
    itemCount: itemsQuery.data?.totalCount ?? 0,
    locationCount: locationsQuery.data
      ? countLocations(locationsQuery.data)
      : 0,
    expiringSoonCount: kitchenQuery.data?.expiringSoonCount ?? 0,
    expiredCount: kitchenQuery.data?.expiredCount ?? 0,
  };

  const recentMovements: Movement[] = movementsQuery.data?.items ?? [];

  return {
    summary,
    recentMovements,
    expiringWindowDays: EXPIRING_WINDOW_DAYS,
    isSummaryLoading:
      itemsQuery.isPending ||
      locationsQuery.isPending ||
      kitchenQuery.isPending,
    isMovementsLoading: movementsQuery.isPending,
    isMovementsError: movementsQuery.isError,
    movementsError: movementsQuery.error,
  };
}

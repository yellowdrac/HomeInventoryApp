import { useQuery } from '@tanstack/react-query';
import { kitchenApi } from '@features/Kitchen/api/kitchenApi';
import { localDateString } from '@features/Kitchen/lib/asOfDate';
import type { KitchenOverviewParams } from '@features/Kitchen/types';

interface UseKitchenOverviewArgs {
  /** Restrict to a location subtree (the kitchen/pantry); null = whole home. */
  locationId?: string | null;
  withinDays?: number;
  /** Override the client's local "today" (mainly for tests). */
  asOfDate?: string;
}

export const kitchenOverviewQueryKey = (params: KitchenOverviewParams) =>
  ['kitchen', 'overview', params] as const;

/**
 * Reads the kitchen overview (expired / expiring-soon / perishable counts and
 * the nearest upcoming expiry). Sends the user's local date as `asOfDate`.
 */
export function useKitchenOverview(args: UseKitchenOverviewArgs = {}) {
  const params: KitchenOverviewParams = {
    withinDays: args.withinDays ?? 7,
    asOfDate: args.asOfDate ?? localDateString(),
    ...(args.locationId ? { locationId: args.locationId } : {}),
  };

  return useQuery({
    queryKey: kitchenOverviewQueryKey(params),
    queryFn: () => kitchenApi.getOverview(params),
  });
}

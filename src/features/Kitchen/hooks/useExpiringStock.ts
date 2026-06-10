import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { kitchenApi } from '@features/Kitchen/api/kitchenApi';
import { localDateString } from '@features/Kitchen/lib/asOfDate';
import type { GetExpiringStockParams } from '@features/Kitchen/types';

interface UseExpiringStockArgs {
  withinDays?: number;
  includeExpired?: boolean;
  /** Restrict to a location subtree (the kitchen/pantry); null = whole home. */
  locationId?: string | null;
  category?: string;
  /** Override the client's local "today" (mainly for tests). */
  asOfDate?: string;
}

export const expiringStockQueryKey = (params: GetExpiringStockParams) =>
  ['expirations', 'list', params] as const;

/**
 * Reads the household's perishable lots due within the window (and, by default,
 * already-expired ones), FEFO-ordered by the backend. Sends the user's local
 * date as `asOfDate` so "today" matches their calendar.
 */
export function useExpiringStock(args: UseExpiringStockArgs = {}) {
  const category = args.category?.trim();
  const params: GetExpiringStockParams = {
    withinDays: args.withinDays ?? 7,
    includeExpired: args.includeExpired ?? true,
    asOfDate: args.asOfDate ?? localDateString(),
    ...(args.locationId ? { locationId: args.locationId } : {}),
    ...(category ? { category } : {}),
  };

  return useQuery({
    queryKey: expiringStockQueryKey(params),
    queryFn: () => kitchenApi.getExpiringStock(params),
    placeholderData: keepPreviousData,
  });
}

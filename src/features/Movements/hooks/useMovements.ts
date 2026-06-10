import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { movementsApi } from '@features/Movements/api/movementsApi';
import type { GetMovementsParams } from '@features/Movements/types';

export const movementsQueryKey = (params: GetMovementsParams = {}) =>
  ['movements', 'list', params] as const;

/**
 * Reads a page of the household's movement history (newest first), optionally
 * filtered by item, location, type and date range. Keeps the previous page
 * visible while a new query is in flight so the list does not flash to a
 * skeleton when a filter changes.
 */
export function useMovements(params: GetMovementsParams = {}) {
  return useQuery({
    queryKey: movementsQueryKey(params),
    queryFn: () => movementsApi.list(params),
    placeholderData: keepPreviousData,
  });
}

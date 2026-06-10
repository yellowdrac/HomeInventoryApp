import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { itemsApi } from '@features/Items/api/itemsApi';
import type { GetItemsParams } from '@features/Items/types';

export const itemsQueryKey = (params: GetItemsParams = {}) =>
  ['items', 'list', params] as const;

/**
 * Reads a page of the household's items, optionally filtered by name/category.
 * Keeps the previous page visible while a new query (e.g. a changed text
 * filter) is in flight, so the list does not flash to a skeleton on each
 * keystroke.
 */
export function useItems(params: GetItemsParams = {}) {
  return useQuery({
    queryKey: itemsQueryKey(params),
    queryFn: () => itemsApi.list(params),
    placeholderData: keepPreviousData,
  });
}

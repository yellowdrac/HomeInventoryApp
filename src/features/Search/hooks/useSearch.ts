import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useDebouncedValue } from '@/core/hooks/useDebouncedValue';
import { searchApi } from '@features/Search/api/searchApi';

/** Minimum length before a search fires, so single keystrokes are ignored. */
export const MIN_SEARCH_LENGTH = 2;

interface SearchFilters {
  category?: string;
}

export const searchQueryKey = (query: string, category: string | null) =>
  ['search', 'list', query, category] as const;

/**
 * Searches the household inventory for "where is my item?". Debounces the term
 * (~300 ms) so it does not fire on every keystroke, and stays disabled until at
 * least {@link MIN_SEARCH_LENGTH} characters are typed. Keeps the previous
 * results visible while a new query is in flight to avoid flashing.
 */
export function useSearch(query: string, filters: SearchFilters = {}) {
  const debounced = useDebouncedValue(query.trim(), 300);
  const category = filters.category?.trim() || null;
  const enabled = debounced.length >= MIN_SEARCH_LENGTH;

  const result = useQuery({
    queryKey: searchQueryKey(debounced, category),
    queryFn: () =>
      searchApi.search({
        q: debounced,
        ...(category ? { category } : {}),
      }),
    enabled,
    placeholderData: keepPreviousData,
  });

  return { ...result, debouncedQuery: debounced, isEnabled: enabled };
}

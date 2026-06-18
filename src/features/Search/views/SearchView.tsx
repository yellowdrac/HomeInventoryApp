import { useEffect, useId, useState } from 'react';
import { useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Alert, Input, Label } from '@/core/components/ui';
import { SearchIcon } from '@/core/components/icons';
import {
  MIN_SEARCH_LENGTH,
  useSearch,
} from '@features/Search/hooks/useSearch';
import { getSearchErrorMessage } from '@features/Search/lib/searchErrors';
import { SearchResultCard } from '@features/Search/components/SearchResultCard';

/**
 * Search page ("where is my item?"). The term lives in the URL (`?q=`) so the
 * page is shareable and survives reloads. Results lead with the location
 * breadcrumb so the answer is visible at a glance.
 */
export function SearchView() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get('q') ?? '');
  const searchId = useId();

  const {
    data,
    isError,
    error,
    isFetching,
    isPlaceholderData,
    isEnabled,
    debouncedQuery,
  } = useSearch(query);

  // Keep the URL in sync with the (debounced) term so the page is shareable.
  useEffect(() => {
    const current = searchParams.get('q') ?? '';
    if (debouncedQuery === current) {
      return;
    }
    const next = new URLSearchParams(searchParams);
    if (debouncedQuery) {
      next.set('q', debouncedQuery);
    } else {
      next.delete('q');
    }
    setSearchParams(next, { replace: true });
  }, [debouncedQuery, searchParams, setSearchParams]);

  const results = data?.items ?? [];
  const isLoading = isEnabled && isFetching && !data;
  const showResults = isEnabled && !isError && results.length > 0;
  const showEmpty =
    isEnabled && !isError && !isFetching && results.length === 0;

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t('search.title')}</h1>
        <p className="text-sm text-slate-600">
          {t('search.description')}
        </p>
      </header>

      <div className="relative">
        <Label htmlFor={searchId} className="sr-only">
          {t('search.label')}
        </Label>
        <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
        <Input
          id={searchId}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('search.placeholder')}
          autoComplete="off"
          autoFocus
          className="h-12 pl-11 text-base"
        />
      </div>

      {isError ? (
        <Alert tone="error">{getSearchErrorMessage(error)}</Alert>
      ) : null}

      {!isEnabled ? (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-10 text-center text-sm text-slate-600">
          {t('search.minChars', { count: MIN_SEARCH_LENGTH })}
        </p>
      ) : null}

      {isLoading ? <SearchSkeleton /> : null}

      {showEmpty ? (
        <p
          className="rounded-2xl border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-600"
          role="status"
        >
          {t('search.noResults', { query: debouncedQuery })}
        </p>
      ) : null}

      {showResults ? (
        <ul
          className="space-y-3"
          aria-label={t('search.resultsLabel')}
          aria-busy={isPlaceholderData || undefined}
        >
          {results.map((result) => (
            <li key={result.itemId}>
              <SearchResultCard result={result} />
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

/** Accessible loading placeholder for the search results. */
function SearchSkeleton() {
  const { t } = useTranslation();
  return (
    <div
      className="space-y-3"
      role="status"
      aria-busy="true"
      aria-label={t('search.searching')}
    >
      {[0, 1, 2].map((row) => (
        <div
          key={row}
          className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-slate-100"
        />
      ))}
    </div>
  );
}

import { Link } from 'react-router';
import { ChevronRightIcon, PackageIcon } from '@/core/components/icons';
import { TrackingTypeBadge } from '@features/Items/components/TrackingTypeBadge';
import { formatDate, formatQuantity } from '@features/Items/lib/format';
import { LocationBreadcrumb } from '@features/Search/components/LocationBreadcrumb';
import type { SearchResultItem } from '@features/Search/types';

interface SearchResultCardProps {
  result: SearchResultItem;
}

/**
 * A single search hit: the matched item (linking to its detail) and every place
 * it is stored, with the location breadcrumb as the most prominent element.
 */
export function SearchResultCard({ result }: SearchResultCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <Link
          to={`/items/${result.itemId}`}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-lg transition-colors hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
        >
          <span
            className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500"
            aria-hidden="true"
          >
            <PackageIcon className="size-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2">
              <span className="truncate text-base font-semibold text-slate-900">
                {result.name}
              </span>
              <TrackingTypeBadge type={result.trackingType} />
            </span>
            {result.category ? (
              <span className="block truncate text-xs text-slate-500">
                {result.category}
              </span>
            ) : null}
          </span>
          <ChevronRightIcon className="size-5 shrink-0 text-slate-400" />
        </Link>
        <span className="shrink-0 text-sm font-semibold text-slate-900">
          {formatQuantity(result.totalQuantity, result.unit)}
        </span>
      </div>

      <div className="mt-3 border-t border-slate-100 pt-3">
        {result.placements.length === 0 ? (
          <p className="text-sm text-slate-500">Not stored anywhere yet.</p>
        ) : (
          <ul className="space-y-2" aria-label={`Where ${result.name} is stored`}>
            {result.placements.map((placement) => {
              const expiration = formatDate(placement.expirationDate);
              return (
                <li
                  key={placement.locationId}
                  className="flex flex-wrap items-center justify-between gap-2"
                >
                  <LocationBreadcrumb
                    breadcrumb={placement.breadcrumb}
                    locationId={placement.locationId}
                  />
                  <div className="flex items-center gap-3 text-sm">
                    {expiration ? (
                      <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                        Expires {expiration}
                      </span>
                    ) : null}
                    <span className="font-semibold text-slate-900">
                      {formatQuantity(placement.quantity, result.unit)}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </article>
  );
}

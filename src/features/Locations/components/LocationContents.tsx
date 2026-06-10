import { Link } from 'react-router';
import { Alert } from '@/core/components/ui';
import { ChevronRightIcon, PackageIcon } from '@/core/components/icons';
import { useLocationContents } from '@features/Locations/hooks/useLocationContents';
import { getLocationErrorMessage } from '@features/Locations/lib/locationErrors';

interface LocationContentsProps {
  locationId: string;
  locationName: string;
}

/**
 * Read-only listing of the stock stored at a location, each row linking to its
 * item. Moving or consuming stock from here is out of scope (Phase 4).
 */
export function LocationContents({
  locationId,
  locationName,
}: LocationContentsProps) {
  const { data, isPending, isError, error } = useLocationContents(locationId);

  return (
    <section
      aria-label={`Contents of ${locationName}`}
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <h2 className="text-sm font-semibold text-slate-900">
        In {locationName}
      </h2>

      <div className="mt-3">
        {isPending ? (
          <div
            className="space-y-2"
            role="status"
            aria-busy="true"
            aria-label="Loading contents"
          >
            {[0, 1].map((row) => (
              <div
                key={row}
                className="h-12 animate-pulse rounded-lg bg-slate-100"
              />
            ))}
          </div>
        ) : null}

        {isError ? (
          <Alert tone="error">{getLocationErrorMessage(error)}</Alert>
        ) : null}

        {data && data.length === 0 ? (
          <p className="px-1 py-4 text-sm text-slate-500">
            Nothing is stored here yet.
          </p>
        ) : null}

        {data && data.length > 0 ? (
          <ul className="divide-y divide-slate-100">
            {data.map((lot) => (
              <li key={lot.id}>
                <Link
                  to={`/items/${lot.itemId}`}
                  className="flex items-center gap-3 rounded-lg px-1 py-2 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                >
                  <span
                    className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500"
                    aria-hidden="true"
                  >
                    <PackageIcon className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm text-slate-800">
                    {lot.itemName}
                  </span>
                  <span className="shrink-0 text-sm font-semibold text-slate-900">
                    {lot.quantity}
                  </span>
                  <ChevronRightIcon className="size-4 shrink-0 text-slate-400" />
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}

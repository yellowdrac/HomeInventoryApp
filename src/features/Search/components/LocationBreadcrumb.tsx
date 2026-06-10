import { Fragment } from 'react';
import { Link } from 'react-router';
import { ChevronRightIcon, MapPinIcon } from '@/core/components/icons';
import type { SearchBreadcrumbItem } from '@features/Search/types';

interface LocationBreadcrumbProps {
  /** Names from the root down to the storing location, inclusive. */
  breadcrumb: SearchBreadcrumbItem[];
  /** Id of the storing location; the breadcrumb links there in the tree. */
  locationId: string;
}

/**
 * Prominent "where is it" breadcrumb (e.g. "House › Bedroom › Closet › Box 3").
 * The whole path links to the storing location in the Locations tree.
 */
export function LocationBreadcrumb({
  breadcrumb,
  locationId,
}: LocationBreadcrumbProps) {
  const label = breadcrumb.map((entry) => entry.name).join(' › ');

  return (
    <Link
      to={`/locations?location=${encodeURIComponent(locationId)}`}
      aria-label={`Go to location: ${label}`}
      className="group inline-flex max-w-full items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-sm font-medium text-emerald-800 transition-colors hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
    >
      <MapPinIcon className="size-4 shrink-0 text-emerald-600" />
      <span className="flex flex-wrap items-center gap-x-1 gap-y-0.5">
        {breadcrumb.map((entry, index) => (
          <Fragment key={entry.id}>
            {index > 0 ? (
              <ChevronRightIcon
                className="size-3.5 shrink-0 text-emerald-500"
                aria-hidden="true"
              />
            ) : null}
            <span
              className={
                index === breadcrumb.length - 1 ? 'font-semibold' : undefined
              }
            >
              {entry.name}
            </span>
          </Fragment>
        ))}
      </span>
    </Link>
  );
}

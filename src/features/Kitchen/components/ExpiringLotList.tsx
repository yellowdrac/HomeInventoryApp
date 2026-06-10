import { Link } from 'react-router';
import {
  MinusIcon,
  MoreVerticalIcon,
  PackageIcon,
  TrashIcon,
} from '@/core/components/icons';
import { DropdownMenu, type DropdownMenuItem } from '@/core/components/ui';
import { formatDate, formatQuantity } from '@features/Items/lib/format';
import { LocationBreadcrumb } from '@features/Search/components/LocationBreadcrumb';
import { ExpirationStatusBadge } from '@features/Kitchen/components/ExpirationStatusBadge';
import { formatDaysUntil } from '@features/Kitchen/lib/format';
import type { ExpiringLot } from '@features/Kitchen/types';

interface ExpiringLotListProps {
  lots: ExpiringLot[];
  onConsume: (lot: ExpiringLot) => void;
  onDiscard: (lot: ExpiringLot) => void;
}

/**
 * FEFO list of perishable lots (earliest expiry first, ordered by the backend).
 * Each row leads with the item and its location breadcrumb, and offers consume
 * and discard actions.
 */
export function ExpiringLotList({
  lots,
  onConsume,
  onDiscard,
}: ExpiringLotListProps) {
  return (
    <ul className="space-y-2" aria-label="Perishable stock">
      {lots.map((lot) => {
        const menuItems: DropdownMenuItem[] = [
          {
            label: 'Consume',
            icon: <MinusIcon className="size-4" />,
            onSelect: () => onConsume(lot),
          },
          {
            label: 'Discard',
            icon: <TrashIcon className="size-4" />,
            tone: 'danger',
            onSelect: () => onDiscard(lot),
          },
        ];

        return (
          <li
            key={lot.stockLotId}
            className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4"
          >
            <div className="flex items-start gap-3">
              <span
                className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500"
                aria-hidden="true"
              >
                <PackageIcon className="size-5" />
              </span>

              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    to={`/items/${lot.itemId}`}
                    className="truncate font-semibold text-slate-900 transition-colors hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 rounded"
                  >
                    {lot.itemName}
                  </Link>
                  <ExpirationStatusBadge status={lot.status} />
                </div>

                <LocationBreadcrumb
                  breadcrumb={lot.breadcrumb}
                  locationId={lot.locationId}
                />

                <p className="text-xs text-slate-500">
                  Expires {formatDate(lot.expirationDate)}
                  <span aria-hidden="true"> · </span>
                  <span className="font-medium text-slate-600">
                    {formatDaysUntil(lot.daysUntilExpiry)}
                  </span>
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <span className="text-sm font-semibold text-slate-900">
                  {formatQuantity(lot.quantity)}
                </span>
                <DropdownMenu
                  triggerLabel={`Actions for ${lot.itemName} in ${lot.locationName}`}
                  trigger={<MoreVerticalIcon className="size-5" />}
                  items={menuItems}
                />
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

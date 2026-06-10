import {
  MapPinIcon,
  MoreVerticalIcon,
  PencilIcon,
  TrashIcon,
} from '@/core/components/icons';
import { DropdownMenu, type DropdownMenuItem } from '@/core/components/ui';
import {
  formatDate,
  formatLocationPath,
  formatQuantity,
} from '@features/Items/lib/format';
import type { Item, StockLot } from '@features/Items/types';

interface StockLotListProps {
  item: Item;
  lots: StockLot[];
  onEdit: (lot: StockLot) => void;
  onDelete: (lot: StockLot) => void;
}

/** Lists an item's stock lots with location, quantity, dates and row actions. */
export function StockLotList({
  item,
  lots,
  onEdit,
  onDelete,
}: StockLotListProps) {
  return (
    <ul className="divide-y divide-slate-100">
      {lots.map((lot) => {
        const expiration = formatDate(lot.expirationDate);
        const acquired = formatDate(lot.acquiredDate);
        const menuItems: DropdownMenuItem[] = [
          {
            label: 'Edit',
            icon: <PencilIcon className="size-4" />,
            onSelect: () => onEdit(lot),
          },
          {
            label: 'Delete',
            icon: <TrashIcon className="size-4" />,
            tone: 'danger',
            onSelect: () => onDelete(lot),
          },
        ];

        return (
          <li
            key={lot.id}
            className="flex items-start gap-3 py-3 first:pt-1 last:pb-1"
          >
            <span
              className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500"
              aria-hidden="true"
            >
              <MapPinIcon className="size-5" />
            </span>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900">
                {lot.locationName}
              </p>
              {lot.locationBreadcrumb.length > 1 ? (
                <p className="truncate text-xs text-slate-500">
                  {formatLocationPath(lot.locationBreadcrumb)}
                </p>
              ) : null}
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                {acquired ? <span>Acquired {acquired}</span> : null}
                {expiration ? (
                  <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 font-medium text-amber-700">
                    Expires {expiration}
                  </span>
                ) : null}
              </div>
            </div>

            <span className="shrink-0 text-sm font-semibold text-slate-900">
              {formatQuantity(lot.quantity, item.unit)}
            </span>

            <DropdownMenu
              triggerLabel={`Actions for stock in ${lot.locationName}`}
              trigger={<MoreVerticalIcon className="size-5" />}
              items={menuItems}
            />
          </li>
        );
      })}
    </ul>
  );
}

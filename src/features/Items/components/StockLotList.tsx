import { useTranslation } from 'react-i18next';
import {
  MapPinIcon,
  MinusIcon,
  MoreVerticalIcon,
  MoveIcon,
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
  onMove: (lot: StockLot) => void;
  onConsume: (lot: StockLot) => void;
  onDiscard: (lot: StockLot) => void;
  onEdit: (lot: StockLot) => void;
  onDelete: (lot: StockLot) => void;
}

/** Lists an item's stock lots with location, quantity, dates and row actions. */
export function StockLotList({
  item,
  lots,
  onMove,
  onConsume,
  onDiscard,
  onEdit,
  onDelete,
}: StockLotListProps) {
  const { t } = useTranslation();
  return (
    <ul className="divide-y divide-slate-100">
      {lots.map((lot) => {
        const expiration = formatDate(lot.expirationDate);
        const acquired = formatDate(lot.acquiredDate);
        const menuItems: DropdownMenuItem[] = [
          {
            label: t('stock.move'),
            icon: <MoveIcon className="size-4" />,
            onSelect: () => onMove(lot),
          },
          {
            label: t('stock.consume'),
            icon: <MinusIcon className="size-4" />,
            onSelect: () => onConsume(lot),
          },
          {
            label: t('stock.discard'),
            icon: <TrashIcon className="size-4" />,
            tone: 'danger',
            onSelect: () => onDiscard(lot),
          },
          {
            label: t('common.edit'),
            icon: <PencilIcon className="size-4" />,
            onSelect: () => onEdit(lot),
          },
          {
            label: t('common.delete'),
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
                {acquired ? <span>{t('stock.acquired', { date: acquired })}</span> : null}
                {expiration ? (
                  <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 font-medium text-amber-700">
                    {t('stock.expires', { date: expiration })}
                  </span>
                ) : null}
              </div>
            </div>

            <span className="shrink-0 text-sm font-semibold text-slate-900">
              {formatQuantity(lot.quantity, item.unit)}
            </span>

            <DropdownMenu
              triggerLabel={t('stock.actionsForLot', { location: lot.locationName })}
              trigger={<MoreVerticalIcon className="size-5" />}
              items={menuItems}
            />
          </li>
        );
      })}
    </ul>
  );
}

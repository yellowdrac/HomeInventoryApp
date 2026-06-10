import { useState } from 'react';
import { Link } from 'react-router';
import { Alert, DropdownMenu, type DropdownMenuItem } from '@/core/components/ui';
import {
  ChevronRightIcon,
  MinusIcon,
  MoreVerticalIcon,
  MoveIcon,
  PackageIcon,
  TrashIcon,
} from '@/core/components/icons';
import { useLocationContents } from '@features/Locations/hooks/useLocationContents';
import { getLocationErrorMessage } from '@features/Locations/lib/locationErrors';
import { MoveStockDialog } from '@features/Items/components/MoveStockDialog';
import { ConsumeStockDialog } from '@features/Items/components/ConsumeStockDialog';
import { DiscardStockDialog } from '@features/Items/components/DiscardStockDialog';
import type { StockLot } from '@features/Items/types';

interface LocationContentsProps {
  locationId: string;
  locationName: string;
}

type StockDialog =
  | { kind: 'move'; lot: StockLot }
  | { kind: 'consume'; lot: StockLot }
  | { kind: 'discard'; lot: StockLot }
  | null;

/**
 * Listing of the stock stored at a location. Each row links to its item and
 * offers move/consume/discard actions, reusing the Items stock dialogs.
 */
export function LocationContents({
  locationId,
  locationName,
}: LocationContentsProps) {
  const { data, isPending, isError, error } = useLocationContents(locationId);
  const [dialog, setDialog] = useState<StockDialog>(null);

  const closeDialog = () => setDialog(null);

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
            {data.map((lot) => {
              const menuItems: DropdownMenuItem[] = [
                {
                  label: 'Move',
                  icon: <MoveIcon className="size-4" />,
                  onSelect: () => setDialog({ kind: 'move', lot }),
                },
                {
                  label: 'Consume',
                  icon: <MinusIcon className="size-4" />,
                  onSelect: () => setDialog({ kind: 'consume', lot }),
                },
                {
                  label: 'Discard',
                  icon: <TrashIcon className="size-4" />,
                  tone: 'danger',
                  onSelect: () => setDialog({ kind: 'discard', lot }),
                },
              ];

              return (
                <li key={lot.id} className="flex items-center gap-2 py-1">
                  <Link
                    to={`/items/${lot.itemId}`}
                    className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-1 py-1.5 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
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
                  <DropdownMenu
                    triggerLabel={`Actions for ${lot.itemName} in ${locationName}`}
                    trigger={<MoreVerticalIcon className="size-5" />}
                    items={menuItems}
                  />
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>

      {dialog?.kind === 'move' ? (
        <MoveStockDialog open onClose={closeDialog} lot={dialog.lot} />
      ) : null}

      {dialog?.kind === 'consume' ? (
        <ConsumeStockDialog open onClose={closeDialog} lot={dialog.lot} />
      ) : null}

      {dialog?.kind === 'discard' ? (
        <DiscardStockDialog open onClose={closeDialog} lot={dialog.lot} />
      ) : null}
    </section>
  );
}

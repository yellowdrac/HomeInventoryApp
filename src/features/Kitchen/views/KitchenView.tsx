import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Button } from '@/core/components/ui';
import { TrashIcon, UtensilsIcon } from '@/core/components/icons';
import { ConsumeStockDialog } from '@features/Items/components/ConsumeStockDialog';
import { DiscardStockDialog } from '@features/Items/components/DiscardStockDialog';
import type { StockLot } from '@features/Items/types';
import { useExpiringStock } from '@features/Kitchen/hooks/useExpiringStock';
import { useKitchenOverview } from '@features/Kitchen/hooks/useKitchenOverview';
import { getKitchenErrorMessage } from '@features/Kitchen/lib/kitchenErrors';
import { KitchenSummaryCards } from '@features/Kitchen/components/KitchenSummaryCards';
import { KitchenFilters } from '@features/Kitchen/components/KitchenFilters';
import { ExpiringLotList } from '@features/Kitchen/components/ExpiringLotList';
import { DiscardExpiredDialog } from '@features/Kitchen/components/DiscardExpiredDialog';
import type { ExpiringLot } from '@features/Kitchen/types';

type KitchenDialog =
  | { kind: 'consume'; lot: ExpiringLot }
  | { kind: 'discard'; lot: ExpiringLot }
  | { kind: 'discard-all' }
  | null;

/** Adapts an expiring lot into the StockLot shape the F4 dialogs expect. */
function toStockLot(lot: ExpiringLot): StockLot {
  return {
    id: lot.stockLotId,
    itemId: lot.itemId,
    itemName: lot.itemName,
    locationId: lot.locationId,
    locationName: lot.locationName,
    locationBreadcrumb: lot.breadcrumb.map((entry) => entry.name),
    quantity: lot.quantity,
    expirationDate: lot.expirationDate,
    acquiredDate: null,
  };
}

/**
 * Kitchen / expirations dashboard: summary counts, FEFO list of perishable
 * lots, per-lot consume/discard actions and a bulk "discard all expired".
 * Optionally scoped to a location subtree and a configurable warning window.
 */
export function KitchenView() {
  const { t } = useTranslation();
  const [withinDays, setWithinDays] = useState(7);
  const [locationId, setLocationId] = useState<string | null>(null);
  const [dialog, setDialog] = useState<KitchenDialog>(null);

  const closeDialog = () => setDialog(null);

  const overview = useKitchenOverview({ locationId, withinDays });
  const {
    data: lots,
    isPending,
    isError,
    error,
    isPlaceholderData,
  } = useExpiringStock({ locationId, withinDays });

  const expiredCount = overview.data?.expiredCount ?? 0;

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
          <UtensilsIcon className="size-7 text-slate-400" />
          {t('kitchen.title')}
        </h1>
        <p className="text-sm text-slate-600">
          {t('kitchen.description')}
        </p>
      </header>

      <KitchenSummaryCards
        overview={overview.data}
        withinDays={withinDays}
        isLoading={overview.isPending}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <KitchenFilters
            withinDays={withinDays}
            onWithinDaysChange={setWithinDays}
            locationId={locationId}
            onLocationChange={setLocationId}
          />
        </div>

        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">
              {t('kitchen.expiringFirst')}
            </h2>
            {expiredCount > 0 ? (
              <Button
                variant="secondary"
                className="text-red-600 hover:bg-red-50"
                onClick={() => setDialog({ kind: 'discard-all' })}
              >
                <TrashIcon className="size-4" />
                {t('kitchen.discardAllExpired')}
              </Button>
            ) : null}
          </div>

          {isError ? (
            <Alert tone="error">{getKitchenErrorMessage(error)}</Alert>
          ) : null}

          {isPending ? <ExpiringSkeleton /> : null}

          {!isPending && !isError && (lots?.length ?? 0) === 0 ? (
            <p
              className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-10 text-center text-sm text-slate-600"
              role="status"
            >
              {t('kitchen.nothingExpiringSoon')}
            </p>
          ) : null}

          {lots && lots.length > 0 ? (
            <div aria-busy={isPlaceholderData || undefined}>
              <ExpiringLotList
                lots={lots}
                onConsume={(lot) => setDialog({ kind: 'consume', lot })}
                onDiscard={(lot) => setDialog({ kind: 'discard', lot })}
              />
            </div>
          ) : null}
        </div>
      </div>

      {dialog?.kind === 'consume' ? (
        <ConsumeStockDialog
          open
          onClose={closeDialog}
          lot={toStockLot(dialog.lot)}
        />
      ) : null}

      {dialog?.kind === 'discard' ? (
        <DiscardStockDialog
          open
          onClose={closeDialog}
          lot={toStockLot(dialog.lot)}
        />
      ) : null}

      {dialog?.kind === 'discard-all' ? (
        <DiscardExpiredDialog
          open
          onClose={closeDialog}
          expiredCount={expiredCount}
          locationId={locationId}
        />
      ) : null}
    </section>
  );
}

/** Accessible loading placeholder for the FEFO list. */
function ExpiringSkeleton() {
  const { t } = useTranslation();
  return (
    <div
      className="space-y-2"
      role="status"
      aria-busy="true"
      aria-label={t('kitchen.loadingPerishable')}
    >
      {[0, 1, 2, 3].map((row) => (
        <div
          key={row}
          className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-slate-100"
        />
      ))}
    </div>
  );
}

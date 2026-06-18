import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Alert, Button } from '@/core/components/ui';
import {
  ChevronLeftIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from '@/core/components/icons';
import { useItem } from '@features/Items/hooks/useItem';
import { getItemErrorMessage } from '@features/Items/lib/itemErrors';
import { formatQuantity } from '@features/Items/lib/format';
import { TrackingTypeBadge } from '@features/Items/components/TrackingTypeBadge';
import { StockLotList } from '@features/Items/components/StockLotList';
import { EditItemDialog } from '@features/Items/components/EditItemDialog';
import { DeleteItemDialog } from '@features/Items/components/DeleteItemDialog';
import { AddStockDialog } from '@features/Items/components/AddStockDialog';
import { ItemPhotoManager } from '@features/Items/components/ItemPhotoManager';
import { EditStockLotDialog } from '@features/Items/components/EditStockLotDialog';
import { DeleteStockLotDialog } from '@features/Items/components/DeleteStockLotDialog';
import { MoveStockDialog } from '@features/Items/components/MoveStockDialog';
import { ConsumeStockDialog } from '@features/Items/components/ConsumeStockDialog';
import { DiscardStockDialog } from '@features/Items/components/DiscardStockDialog';
import { TrackingType, type StockLot } from '@features/Items/types';
import { ItemHistory } from '@features/Items/components/ItemHistory';

type Dialog =
  | { kind: 'edit-item' }
  | { kind: 'delete-item' }
  | { kind: 'add-stock' }
  | { kind: 'move-lot'; lot: StockLot }
  | { kind: 'consume-lot'; lot: StockLot }
  | { kind: 'discard-lot'; lot: StockLot }
  | { kind: 'edit-lot'; lot: StockLot }
  | { kind: 'delete-lot'; lot: StockLot }
  | null;

/** Detail page for a single item: its fields plus the list of its stock lots. */
export function ItemDetailView() {
  const { t } = useTranslation();
  const { id = null } = useParams();
  const navigate = useNavigate();
  const { data: item, isPending, isError, error } = useItem(id);
  const [dialog, setDialog] = useState<Dialog>(null);

  const closeDialog = () => setDialog(null);

  return (
    <section className="space-y-6">
      <Link
        to="/items"
        className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 rounded"
      >
        <ChevronLeftIcon className="size-4" />
        {t('items.backToItems')}
      </Link>

      {isPending ? <ItemDetailSkeleton /> : null}

      {isError ? (
        <Alert tone="error">{getItemErrorMessage(error)}</Alert>
      ) : null}

      {item ? (
        <>
          <header className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    {item.name}
                  </h1>
                  <TrackingTypeBadge type={item.trackingType} />
                </div>
                <dl className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-600">
                  {item.category ? (
                    <div className="flex gap-1">
                      <dt className="text-slate-400">{t('items.category')}</dt>
                      <dd>{item.category}</dd>
                    </div>
                  ) : null}
                  {item.barcode ? (
                    <div className="flex gap-1">
                      <dt className="text-slate-400">{t('items.barcode')}</dt>
                      <dd className="font-mono">{item.barcode}</dd>
                    </div>
                  ) : null}
                  <div className="flex gap-1">
                    <dt className="text-slate-400">{t('items.inStock')}</dt>
                    <dd className="font-semibold text-slate-900">
                      {formatQuantity(item.totalQuantity, item.unit)}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setDialog({ kind: 'edit-item' })}
                >
                  <PencilIcon className="size-4" />
                  {t('common.edit')}
                </Button>
                <Button
                  variant="ghost"
                  className="text-red-600 hover:bg-red-50"
                  onClick={() => setDialog({ kind: 'delete-item' })}
                >
                  <TrashIcon className="size-4" />
                  {t('common.delete')}
                </Button>
              </div>
            </div>
          </header>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">{t('photo.title')}</h2>
            <div className="mt-4">
              <ItemPhotoManager item={item} />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-900">{t('stock.title')}</h2>
              <Button onClick={() => setDialog({ kind: 'add-stock' })}>
                <PlusIcon className="size-4" />
                {t('stock.addStock')}
              </Button>
            </div>

            <div className="mt-4">
              {item.lots.length === 0 ? (
                <p className="rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-600">
                  {t('stock.noStock')}
                </p>
              ) : (
                <StockLotList
                  item={item}
                  lots={item.lots}
                  onMove={(lot) => setDialog({ kind: 'move-lot', lot })}
                  onConsume={(lot) => setDialog({ kind: 'consume-lot', lot })}
                  onDiscard={(lot) => setDialog({ kind: 'discard-lot', lot })}
                  onEdit={(lot) => setDialog({ kind: 'edit-lot', lot })}
                  onDelete={(lot) => setDialog({ kind: 'delete-lot', lot })}
                />
              )}
            </div>
          </div>

          <ItemHistory itemId={item.id} />

          {dialog?.kind === 'edit-item' ? (
            <EditItemDialog open onClose={closeDialog} item={item} />
          ) : null}

          {dialog?.kind === 'delete-item' ? (
            <DeleteItemDialog
              open
              onClose={closeDialog}
              item={item}
              onDeleted={() => navigate('/items')}
            />
          ) : null}

          {dialog?.kind === 'add-stock' ? (
            <AddStockDialog open onClose={closeDialog} item={item} />
          ) : null}

          {dialog?.kind === 'move-lot' ? (
            <MoveStockDialog
              open
              onClose={closeDialog}
              lot={dialog.lot}
              isUnique={item.trackingType === TrackingType.Unique}
              unit={item.unit}
            />
          ) : null}

          {dialog?.kind === 'consume-lot' ? (
            <ConsumeStockDialog
              open
              onClose={closeDialog}
              lot={dialog.lot}
              unit={item.unit}
            />
          ) : null}

          {dialog?.kind === 'discard-lot' ? (
            <DiscardStockDialog
              open
              onClose={closeDialog}
              lot={dialog.lot}
              unit={item.unit}
            />
          ) : null}

          {dialog?.kind === 'edit-lot' ? (
            <EditStockLotDialog
              open
              onClose={closeDialog}
              item={item}
              lot={dialog.lot}
            />
          ) : null}

          {dialog?.kind === 'delete-lot' ? (
            <DeleteStockLotDialog
              open
              onClose={closeDialog}
              item={item}
              lot={dialog.lot}
            />
          ) : null}
        </>
      ) : null}
    </section>
  );
}

/** Accessible loading placeholder for the item detail page. */
function ItemDetailSkeleton() {
  const { t } = useTranslation();
  return (
    <div
      className="space-y-6"
      role="status"
      aria-busy="true"
      aria-label={t('items.loadingItem')}
    >
      <div className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-slate-100" />
      <div className="h-48 animate-pulse rounded-2xl border border-slate-200 bg-slate-100" />
    </div>
  );
}

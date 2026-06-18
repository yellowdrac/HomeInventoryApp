import { useTranslation } from 'react-i18next';
import { Alert, Button, Dialog } from '@/core/components/ui';
import { useDeleteStockLot } from '@features/Items/hooks/useDeleteStockLot';
import { getItemErrorMessage } from '@features/Items/lib/itemErrors';
import { formatQuantity } from '@features/Items/lib/format';
import type { Item, StockLot } from '@features/Items/types';

interface DeleteStockLotDialogProps {
  open: boolean;
  onClose: () => void;
  item: Item;
  lot: StockLot;
}

/** Confirmation dialog (`role="alertdialog"`) for removing a stock lot. */
export function DeleteStockLotDialog({
  open,
  onClose,
  item,
  lot,
}: DeleteStockLotDialogProps) {
  const { t } = useTranslation();
  const deleteStockLot = useDeleteStockLot();

  function onConfirm() {
    deleteStockLot.mutate(
      { lotId: lot.id, itemId: item.id },
      { onSuccess: onClose },
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      role="alertdialog"
      title={t('stock.removeStockTitle')}
      description={t('stock.removeStockDescription', { quantity: formatQuantity(lot.quantity, item.unit), location: lot.locationName })}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            type="button"
            variant="primary"
            className="bg-red-600 hover:bg-red-500 focus-visible:ring-red-600"
            onClick={onConfirm}
            isLoading={deleteStockLot.isPending}
          >
            {deleteStockLot.isPending ? t('stock.removing') : t('stock.remove')}
          </Button>
        </>
      }
    >
      {deleteStockLot.isError ? (
        <Alert tone="error">{getItemErrorMessage(deleteStockLot.error)}</Alert>
      ) : null}
    </Dialog>
  );
}

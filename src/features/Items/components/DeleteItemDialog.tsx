import { useTranslation } from 'react-i18next';
import { Alert, Button, Dialog } from '@/core/components/ui';
import { useDeleteItem } from '@features/Items/hooks/useDeleteItem';
import { getItemErrorMessage } from '@features/Items/lib/itemErrors';
import type { Item } from '@features/Items/types';

interface DeleteItemDialogProps {
  open: boolean;
  onClose: () => void;
  item: Item;
  /** Called after a successful delete (e.g. to close or navigate away). */
  onDeleted?: () => void;
}

/**
 * Confirmation dialog (`role="alertdialog"`) for deleting an item. If the
 * backend rejects it (the item still has stock), the error is shown inline and
 * the dialog stays open.
 */
export function DeleteItemDialog({
  open,
  onClose,
  item,
  onDeleted,
}: DeleteItemDialogProps) {
  const { t } = useTranslation();
  const deleteItem = useDeleteItem();

  function onConfirm() {
    deleteItem.mutate(item.id, {
      onSuccess: () => {
        onClose();
        onDeleted?.();
      },
    });
  }

  const hasStock = item.totalQuantity > 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      role="alertdialog"
      title={t('deleteItem.title', { name: item.name })}
      description={
        hasStock
          ? t('deleteItem.hasStockDescription')
          : t('common.cannotBeUndone')
      }
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
            isLoading={deleteItem.isPending}
          >
            {deleteItem.isPending ? t('common.deleting') : t('common.delete')}
          </Button>
        </>
      }
    >
      {deleteItem.isError ? (
        <Alert tone="error">{getItemErrorMessage(deleteItem.error)}</Alert>
      ) : null}
    </Dialog>
  );
}

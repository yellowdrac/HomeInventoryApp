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
      title={`Delete "${item.name}"?`}
      description={
        hasStock
          ? 'This item still has stock. You will need to remove its stock lots first.'
          : 'This action cannot be undone.'
      }
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            className="bg-red-600 hover:bg-red-500 focus-visible:ring-red-600"
            onClick={onConfirm}
            isLoading={deleteItem.isPending}
          >
            {deleteItem.isPending ? 'Deleting...' : 'Delete'}
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

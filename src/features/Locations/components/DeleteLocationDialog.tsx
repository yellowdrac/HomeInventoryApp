import { useTranslation } from 'react-i18next';
import { Alert, Button, Dialog } from '@/core/components/ui';
import { useDeleteLocation } from '@features/Locations/hooks/useDeleteLocation';
import { getLocationErrorMessage } from '@features/Locations/lib/locationErrors';
import type { LocationTreeNode } from '@features/Locations/types';

interface DeleteLocationDialogProps {
  open: boolean;
  onClose: () => void;
  node: LocationTreeNode;
}

/**
 * Confirmation dialog (`role="alertdialog"`) for deleting a location. If the
 * backend rejects the delete (the location has children or stock), the error is
 * shown inline and the dialog stays open.
 */
export function DeleteLocationDialog({
  open,
  onClose,
  node,
}: DeleteLocationDialogProps) {
  const { t } = useTranslation();
  const deleteLocation = useDeleteLocation();

  function onConfirm() {
    deleteLocation.mutate(node.id, { onSuccess: onClose });
  }

  const hasChildren = node.children.length > 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      role="alertdialog"
      title={t('deleteLocation.title', { name: node.name })}
      description={
        hasChildren
          ? t('deleteLocation.hasChildrenDescription')
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
            isLoading={deleteLocation.isPending}
          >
            {deleteLocation.isPending ? t('common.deleting') : t('common.delete')}
          </Button>
        </>
      }
    >
      {deleteLocation.isError ? (
        <Alert tone="error">
          {getLocationErrorMessage(deleteLocation.error)}
        </Alert>
      ) : null}
    </Dialog>
  );
}

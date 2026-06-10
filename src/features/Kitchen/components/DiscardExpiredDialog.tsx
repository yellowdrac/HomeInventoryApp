import { Alert, Button, Dialog } from '@/core/components/ui';
import { useDiscardExpired } from '@features/Kitchen/hooks/useDiscardExpired';
import { localDateString } from '@features/Kitchen/lib/asOfDate';
import { getKitchenErrorMessage } from '@features/Kitchen/lib/kitchenErrors';

interface DiscardExpiredDialogProps {
  open: boolean;
  onClose: () => void;
  /** How many lots are expired (for the confirmation copy). */
  expiredCount: number;
  /** Restrict the bulk discard to a location subtree, when filtering. */
  locationId: string | null;
}

/**
 * Confirmation dialog (`role="alertdialog"`) for discarding every expired lot
 * at once. Each discarded lot is recorded as a movement on the backend.
 */
export function DiscardExpiredDialog({
  open,
  onClose,
  expiredCount,
  locationId,
}: DiscardExpiredDialogProps) {
  const discardExpired = useDiscardExpired();

  function onConfirm() {
    discardExpired.mutate(
      {
        asOfDate: localDateString(),
        ...(locationId ? { locationId } : {}),
      },
      { onSuccess: onClose },
    );
  }

  const lotsLabel = expiredCount === 1 ? '1 expired lot' : `${expiredCount} expired lots`;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      role="alertdialog"
      title="Discard all expired stock?"
      description={`This throws away ${lotsLabel} and records a movement for each. This action cannot be undone.`}
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
            isLoading={discardExpired.isPending}
          >
            {discardExpired.isPending ? 'Discarding...' : 'Discard all'}
          </Button>
        </>
      }
    >
      {discardExpired.isError ? (
        <Alert tone="error">
          {getKitchenErrorMessage(discardExpired.error)}
        </Alert>
      ) : null}
    </Dialog>
  );
}

import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Button, Dialog, FormField, Input } from '@/core/components/ui';
import { useDiscardStock } from '@features/Items/hooks/useDiscardStock';
import { getItemErrorMessage } from '@features/Items/lib/itemErrors';
import { formatQuantity } from '@features/Items/lib/format';
import {
  createDiscardStockSchema,
  toNullableText,
  type DiscardStockFormValues,
} from '@features/Items/schemas';
import type { StockLot } from '@features/Items/types';

interface DiscardStockDialogProps {
  open: boolean;
  onClose: () => void;
  lot: StockLot;
  /** Display unit, when known. */
  unit?: string | null;
}

/**
 * Destructive dialog (`role="alertdialog"`) to discard (throw away) part or all
 * of a stock lot, with an optional reason. The quantity is capped at what is
 * available in the lot.
 */
export function DiscardStockDialog({
  open,
  onClose,
  lot,
  unit,
}: DiscardStockDialogProps) {
  const discardStock = useDiscardStock();
  const available = lot.quantity;
  const schema = useMemo(() => createDiscardStockSchema(available), [available]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DiscardStockFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { quantity: String(available), reason: '' },
  });

  const onSubmit = handleSubmit((values) => {
    discardStock.mutate(
      {
        lotId: lot.id,
        itemId: lot.itemId,
        payload: {
          quantity: Number(values.quantity),
          reason: toNullableText(values.reason),
        },
      },
      { onSuccess: onClose },
    );
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      role="alertdialog"
      title={`Discard "${lot.itemName}"?`}
      description={`This throws away stock in ${lot.locationName} and cannot be undone. Up to ${formatQuantity(
        available,
        unit,
      )} available.`}
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {discardStock.isError ? (
          <Alert tone="error">{getItemErrorMessage(discardStock.error)}</Alert>
        ) : null}

        <FormField
          id="discard-stock-quantity"
          label="Quantity"
          error={errors.quantity?.message}
        >
          {(aria) => (
            <Input
              type="number"
              inputMode="decimal"
              min={0}
              max={available}
              step="any"
              {...aria}
              {...register('quantity')}
            />
          )}
        </FormField>

        <FormField
          id="discard-stock-reason"
          label="Reason"
          hint="Optional"
          error={errors.reason?.message}
        >
          {(aria) => (
            <Input
              type="text"
              placeholder="e.g. expired"
              {...aria}
              {...register('reason')}
            />
          )}
        </FormField>

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="bg-red-600 hover:bg-red-500 focus-visible:ring-red-600"
            isLoading={discardStock.isPending}
          >
            {discardStock.isPending ? 'Discarding...' : 'Discard'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

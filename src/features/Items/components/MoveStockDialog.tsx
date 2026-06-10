import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Button, Dialog, FormField, Input } from '@/core/components/ui';
import { LocationPicker } from '@features/Locations/components/LocationPicker';
import { useMoveStock } from '@features/Items/hooks/useMoveStock';
import { getItemErrorMessage } from '@features/Items/lib/itemErrors';
import { formatQuantity } from '@features/Items/lib/format';
import {
  createMoveStockSchema,
  type MoveStockFormValues,
} from '@features/Items/schemas';
import type { StockLot } from '@features/Items/types';

interface MoveStockDialogProps {
  open: boolean;
  onClose: () => void;
  lot: StockLot;
  /** Unique-tracked items move as a whole lot; the quantity is pinned. */
  isUnique?: boolean;
  /** Display unit, when known. */
  unit?: string | null;
}

/**
 * Dialog to move part (or all) of a stock lot to another location. Reuses the
 * location selector with the lot's current location disabled as a destination,
 * and caps the quantity at what is available in the lot.
 */
export function MoveStockDialog({
  open,
  onClose,
  lot,
  isUnique = false,
  unit,
}: MoveStockDialogProps) {
  const moveStock = useMoveStock();
  const available = lot.quantity;
  const schema = useMemo(() => createMoveStockSchema(available), [available]);
  const disabledIds = useMemo(
    () => new Set([lot.locationId]),
    [lot.locationId],
  );

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MoveStockFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      toLocationId: '',
      quantity: isUnique ? String(available) : '1',
    },
  });

  const onSubmit = handleSubmit((values) => {
    moveStock.mutate(
      {
        lotId: lot.id,
        itemId: lot.itemId,
        payload: {
          toLocationId: values.toLocationId,
          quantity: isUnique ? available : Number(values.quantity),
        },
      },
      { onSuccess: onClose },
    );
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`Move "${lot.itemName}"`}
      description={`Currently ${formatQuantity(available, unit)} in ${
        lot.locationName
      }.`}
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {moveStock.isError ? (
          <Alert tone="error">{getItemErrorMessage(moveStock.error)}</Alert>
        ) : null}

        <FormField
          id="move-stock-destination"
          label="Destination"
          error={errors.toLocationId?.message}
        >
          {(aria) => (
            <Controller
              control={control}
              name="toLocationId"
              render={({ field }) => (
                <LocationPicker
                  value={field.value || null}
                  onChange={field.onChange}
                  disabledIds={disabledIds}
                  invalid={aria.invalid}
                  aria-describedby={aria['aria-describedby']}
                />
              )}
            />
          )}
        </FormField>

        <FormField
          id="move-stock-quantity"
          label="Quantity"
          hint={
            isUnique
              ? 'Unique items move as a whole lot.'
              : `Up to ${formatQuantity(available, unit)} available.`
          }
          error={isUnique ? undefined : errors.quantity?.message}
        >
          {(aria) => (
            <Input
              type="number"
              inputMode="decimal"
              min={isUnique ? available : 0}
              max={available}
              step="any"
              disabled={isUnique}
              {...aria}
              {...register('quantity')}
            />
          )}
        </FormField>

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={moveStock.isPending}>
            {moveStock.isPending ? 'Moving...' : 'Move stock'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

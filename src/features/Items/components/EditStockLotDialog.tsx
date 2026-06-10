import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Button, Dialog, FormField, Input } from '@/core/components/ui';
import { useUpdateStockLot } from '@features/Items/hooks/useUpdateStockLot';
import { getItemErrorMessage } from '@features/Items/lib/itemErrors';
import {
  stockLotSchema,
  toNullableDate,
  type StockLotFormValues,
} from '@features/Items/schemas';
import { TrackingType, type Item, type StockLot } from '@features/Items/types';

interface EditStockLotDialogProps {
  open: boolean;
  onClose: () => void;
  /** The owning item, for tracking type and unit context. */
  item: Item;
  lot: StockLot;
}

/** Dialog to edit a stock lot's quantity and optional dates. */
export function EditStockLotDialog({
  open,
  onClose,
  item,
  lot,
}: EditStockLotDialogProps) {
  const updateStockLot = useUpdateStockLot();
  const isUnique = item.trackingType === TrackingType.Unique;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StockLotFormValues>({
    resolver: zodResolver(stockLotSchema),
    defaultValues: {
      quantity: String(lot.quantity),
      expirationDate: lot.expirationDate ?? '',
      acquiredDate: lot.acquiredDate ?? '',
    },
  });

  const onSubmit = handleSubmit((values) => {
    updateStockLot.mutate(
      {
        lotId: lot.id,
        itemId: item.id,
        payload: {
          quantity: isUnique ? 1 : Number(values.quantity),
          expirationDate: toNullableDate(values.expirationDate),
          acquiredDate: toNullableDate(values.acquiredDate),
        },
      },
      { onSuccess: onClose },
    );
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Edit stock"
      description={`Stored in ${lot.locationName}.`}
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {updateStockLot.isError ? (
          <Alert tone="error">
            {getItemErrorMessage(updateStockLot.error)}
          </Alert>
        ) : null}

        <FormField
          id="edit-lot-quantity"
          label="Quantity"
          hint={
            isUnique
              ? 'Unique items always have a quantity of 1.'
              : item.unit
                ? `Measured in ${item.unit}.`
                : undefined
          }
          error={isUnique ? undefined : errors.quantity?.message}
        >
          {(aria) => (
            <Input
              type="number"
              inputMode="decimal"
              min={isUnique ? 1 : 0}
              step="any"
              disabled={isUnique}
              {...aria}
              {...register('quantity')}
            />
          )}
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            id="edit-lot-acquired"
            label="Acquired date"
            hint="Optional"
            error={errors.acquiredDate?.message}
          >
            {(aria) => (
              <Input type="date" {...aria} {...register('acquiredDate')} />
            )}
          </FormField>

          <FormField
            id="edit-lot-expiration"
            label="Expiration date"
            hint="Optional"
            error={errors.expirationDate?.message}
          >
            {(aria) => (
              <Input type="date" {...aria} {...register('expirationDate')} />
            )}
          </FormField>
        </div>

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={updateStockLot.isPending}>
            {updateStockLot.isPending ? 'Saving...' : 'Save changes'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Button, Dialog, FormField, Input } from '@/core/components/ui';
import { LocationPicker } from '@features/Locations/components/LocationPicker';
import { useAddStock } from '@features/Items/hooks/useAddStock';
import { getItemErrorMessage } from '@features/Items/lib/itemErrors';
import {
  addStockSchema,
  toNullableDate,
  type AddStockFormValues,
} from '@features/Items/schemas';
import { TrackingType, type Item } from '@features/Items/types';

interface AddStockDialogProps {
  open: boolean;
  onClose: () => void;
  item: Item;
}

/**
 * Dialog to add a stock lot to an item: pick a location (reusing the Locations
 * tree), enter a quantity and optional dates. Unique-tracked items are pinned to
 * a quantity of 1.
 */
export function AddStockDialog({ open, onClose, item }: AddStockDialogProps) {
  const addStock = useAddStock();
  const isUnique = item.trackingType === TrackingType.Unique;

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AddStockFormValues>({
    resolver: zodResolver(addStockSchema),
    defaultValues: {
      locationId: '',
      quantity: '1',
      expirationDate: '',
      acquiredDate: '',
    },
  });

  const onSubmit = handleSubmit((values) => {
    addStock.mutate(
      {
        itemId: item.id,
        payload: {
          locationId: values.locationId,
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
      title={`Add stock to "${item.name}"`}
      description="Choose where the stock is stored and how much."
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {addStock.isError ? (
          <Alert tone="error">{getItemErrorMessage(addStock.error)}</Alert>
        ) : null}

        <FormField
          id="add-stock-location"
          label="Location"
          error={errors.locationId?.message}
        >
          {(aria) => (
            <Controller
              control={control}
              name="locationId"
              render={({ field }) => (
                <LocationPicker
                  value={field.value || null}
                  onChange={field.onChange}
                  invalid={aria.invalid}
                  aria-describedby={aria['aria-describedby']}
                />
              )}
            />
          )}
        </FormField>

        <FormField
          id="add-stock-quantity"
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
            id="add-stock-acquired"
            label="Acquired date"
            hint="Optional"
            error={errors.acquiredDate?.message}
          >
            {(aria) => (
              <Input type="date" {...aria} {...register('acquiredDate')} />
            )}
          </FormField>

          <FormField
            id="add-stock-expiration"
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
          <Button type="submit" isLoading={addStock.isPending}>
            {addStock.isPending ? 'Adding...' : 'Add stock'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

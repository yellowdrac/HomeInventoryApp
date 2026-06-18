import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
      title={t('stock.discardTitle', { name: lot.itemName })}
      description={t('stock.discardDescription', { location: lot.locationName, quantity: formatQuantity(available, unit) })}
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {discardStock.isError ? (
          <Alert tone="error">{getItemErrorMessage(discardStock.error)}</Alert>
        ) : null}

        <FormField
          id="discard-stock-quantity"
          label={t('stock.quantity')}
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
          label={t('stock.reason')}
          hint={t('common.optional')}
          error={errors.reason?.message}
        >
          {(aria) => (
            <Input
              type="text"
              placeholder={t('stock.reasonPlaceholderDiscard')}
              {...aria}
              {...register('reason')}
            />
          )}
        </FormField>

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="bg-red-600 hover:bg-red-500 focus-visible:ring-red-600"
            isLoading={discardStock.isPending}
          >
            {discardStock.isPending ? t('stock.discarding') : t('stock.discard')}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

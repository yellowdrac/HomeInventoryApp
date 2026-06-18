import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Alert, Button, Dialog, FormField, Input } from '@/core/components/ui';
import { useConsumeStock } from '@features/Items/hooks/useConsumeStock';
import { getItemErrorMessage } from '@features/Items/lib/itemErrors';
import { formatQuantity } from '@features/Items/lib/format';
import {
  createConsumeStockSchema,
  toNullableText,
  type ConsumeStockFormValues,
} from '@features/Items/schemas';
import type { StockLot } from '@features/Items/types';

interface ConsumeStockDialogProps {
  open: boolean;
  onClose: () => void;
  lot: StockLot;
  /** Display unit, when known. */
  unit?: string | null;
}

/**
 * Dialog to consume (use up) part or all of a stock lot, with an optional
 * reason. The quantity is capped at what is available in the lot.
 */
export function ConsumeStockDialog({
  open,
  onClose,
  lot,
  unit,
}: ConsumeStockDialogProps) {
  const { t } = useTranslation();
  const consumeStock = useConsumeStock();
  const available = lot.quantity;
  const schema = useMemo(() => createConsumeStockSchema(available), [available]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ConsumeStockFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { quantity: String(available), reason: '' },
  });

  const onSubmit = handleSubmit((values) => {
    consumeStock.mutate(
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
      title={t('stock.consumeTitle', { name: lot.itemName })}
      description={t('stock.currentlyInLocation', { quantity: formatQuantity(available, unit), location: lot.locationName })}
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {consumeStock.isError ? (
          <Alert tone="error">{getItemErrorMessage(consumeStock.error)}</Alert>
        ) : null}

        <FormField
          id="consume-stock-quantity"
          label={t('stock.quantity')}
          hint={t('stock.upToAvailable', { quantity: formatQuantity(available, unit) })}
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
          id="consume-stock-reason"
          label={t('stock.reason')}
          hint={t('common.optional')}
          error={errors.reason?.message}
        >
          {(aria) => (
            <Input
              type="text"
              placeholder={t('stock.reasonPlaceholderConsume')}
              {...aria}
              {...register('reason')}
            />
          )}
        </FormField>

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" isLoading={consumeStock.isPending}>
            {consumeStock.isPending ? t('stock.consuming') : t('stock.consume')}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

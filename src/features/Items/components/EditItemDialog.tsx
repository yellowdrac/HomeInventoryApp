import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Alert, Button, Dialog } from '@/core/components/ui';
import { useUpdateItem } from '@features/Items/hooks/useUpdateItem';
import { useUnits } from '@features/Items/hooks/useUnits';
import { getItemErrorMessage } from '@features/Items/lib/itemErrors';
import {
  itemFormSchema,
  parseTrackingType,
  toNullableText,
  type ItemFormValues,
} from '@features/Items/schemas';
import { TrackingType, type Item } from '@features/Items/types';
import { ItemFormFields } from '@features/Items/components/ItemFormFields';
import { ItemPhotoManager } from '@features/Items/components/ItemPhotoManager';

interface EditItemDialogProps {
  open: boolean;
  onClose: () => void;
  item: Item;
}

export function EditItemDialog({ open, onClose, item }: EditItemDialogProps) {
  const { t } = useTranslation();
  const updateItem = useUpdateItem();
  const { data: units = [] } = useUnits();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ItemFormValues>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: {
      name: item.name,
      category: item.category ?? '',
      barcode: item.barcode ?? '',
      trackingType: String(item.trackingType),
      unitId: item.unitId ?? '',
    },
  });

  const trackingType = parseTrackingType(watch('trackingType'));
  const isQuantity = trackingType === TrackingType.Quantity;

  const onSubmit = handleSubmit((values) => {
    updateItem.mutate(
      {
        id: item.id,
        payload: {
          name: values.name,
          category: toNullableText(values.category),
          barcode: toNullableText(values.barcode),
          trackingType: parseTrackingType(values.trackingType),
          unitId: isQuantity && values.unitId ? values.unitId : null,
          photoUrl: item.photoUrl,
          minimumQuantity: item.minimumQuantity,
        },
      },
      { onSuccess: onClose },
    );
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t('items.editItem', { name: item.name })}
      description={t('items.editItemDescription')}
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {updateItem.isError ? (
          <Alert tone="error">{getItemErrorMessage(updateItem.error)}</Alert>
        ) : null}

        <ItemFormFields
          register={register}
          errors={errors}
          idPrefix="edit-item"
          showUnit={isQuantity}
          units={units}
        />

        <div className="space-y-2 border-t border-slate-200 pt-4">
          <p className="text-sm font-medium text-slate-700">{t('photo.title')}</p>
          <ItemPhotoManager item={item} />
        </div>

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" isLoading={updateItem.isPending}>
            {updateItem.isPending ? t('common.saving') : t('common.saveChanges')}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

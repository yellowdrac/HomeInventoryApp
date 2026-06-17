import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Button, Dialog } from '@/core/components/ui';
import { useUpdateItem } from '@features/Items/hooks/useUpdateItem';
import { getItemErrorMessage } from '@features/Items/lib/itemErrors';
import {
  itemFormSchema,
  parseTrackingType,
  toNullableMinimumQuantity,
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

/** Dialog to edit an existing item's catalog fields. */
export function EditItemDialog({ open, onClose, item }: EditItemDialogProps) {
  const updateItem = useUpdateItem();
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
      unit: item.unit ?? '',
      minimumQuantity: item.minimumQuantity != null ? String(item.minimumQuantity) : '',
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
          unit: isQuantity ? toNullableText(values.unit) : null,
          minimumQuantity: isQuantity ? toNullableMinimumQuantity(values.minimumQuantity) : null,
          photoUrl: item.photoUrl,
        },
      },
      { onSuccess: onClose },
    );
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`Edit "${item.name}"`}
      description="Update this item's details."
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
        />

        <div className="space-y-2 border-t border-slate-200 pt-4">
          <p className="text-sm font-medium text-slate-700">Photo</p>
          <ItemPhotoManager item={item} />
        </div>

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={updateItem.isPending}>
            {updateItem.isPending ? 'Saving...' : 'Save changes'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

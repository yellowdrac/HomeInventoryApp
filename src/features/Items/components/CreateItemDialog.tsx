import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Button, Dialog } from '@/core/components/ui';
import { useCreateItem } from '@features/Items/hooks/useCreateItem';
import { getItemErrorMessage } from '@features/Items/lib/itemErrors';
import {
  itemFormSchema,
  parseTrackingType,
  toNullableText,
  type ItemFormValues,
} from '@features/Items/schemas';
import { TrackingType } from '@features/Items/types';
import { ItemFormFields } from '@features/Items/components/ItemFormFields';

interface CreateItemDialogProps {
  open: boolean;
  onClose: () => void;
}

/** Dialog to create a new item in the household catalog. */
export function CreateItemDialog({ open, onClose }: CreateItemDialogProps) {
  const createItem = useCreateItem();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ItemFormValues>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: {
      name: '',
      category: '',
      barcode: '',
      trackingType: String(TrackingType.Quantity),
      unit: '',
    },
  });

  const trackingType = parseTrackingType(watch('trackingType'));
  const isQuantity = trackingType === TrackingType.Quantity;

  const onSubmit = handleSubmit((values) => {
    createItem.mutate(
      {
        name: values.name,
        category: toNullableText(values.category),
        barcode: toNullableText(values.barcode),
        trackingType: parseTrackingType(values.trackingType),
        unit: isQuantity ? toNullableText(values.unit) : null,
        photoUrl: null,
      },
      { onSuccess: onClose },
    );
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Add item"
      description="Add a product to your household catalog."
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {createItem.isError ? (
          <Alert tone="error">{getItemErrorMessage(createItem.error)}</Alert>
        ) : null}

        <ItemFormFields
          register={register}
          errors={errors}
          idPrefix="create-item"
          showUnit={isQuantity}
        />

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={createItem.isPending}>
            {createItem.isPending ? 'Creating...' : 'Create'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

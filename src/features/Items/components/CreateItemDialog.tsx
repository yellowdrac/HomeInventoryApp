import { useId, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { Alert, Button, Dialog } from '@/core/components/ui';
import { useObjectUrl } from '@/core/hooks/useObjectUrl';
import { useCreateItem } from '@features/Items/hooks/useCreateItem';
import { itemsApi } from '@features/Items/api/itemsApi';
import { invalidateItemData } from '@features/Items/lib/itemQueries';
import { getItemErrorMessage } from '@features/Items/lib/itemErrors';
import {
  itemFormSchema,
  parseTrackingType,
  toNullableText,
  type ItemFormValues,
} from '@features/Items/schemas';
import { TrackingType } from '@features/Items/types';
import { ItemFormFields } from '@features/Items/components/ItemFormFields';
import { ItemPhotoInput } from '@features/Items/components/ItemPhotoInput';

interface CreateItemDialogProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Dialog to create a new item in the household catalog. An optional photo can be
 * attached: because the upload endpoint needs the item id, the item is created
 * first and then the staged photo is uploaded. If only the photo fails, the
 * item already exists, so the dialog stays open to retry the photo.
 */
export function CreateItemDialog({ open, onClose }: CreateItemDialogProps) {
  const queryClient = useQueryClient();
  const createItem = useCreateItem();
  const photoInputId = useId();

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [createdItemId, setCreatedItemId] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const photoPreview = useObjectUrl(photoFile);

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
  const isPending = createItem.isPending || isUploadingPhoto;

  /** Uploads the staged photo to the given item; returns whether it succeeded. */
  async function uploadStagedPhoto(itemId: string): Promise<boolean> {
    if (!photoFile) {
      return true;
    }
    setIsUploadingPhoto(true);
    setPhotoError(null);
    try {
      await itemsApi.uploadPhoto(itemId, photoFile);
      await invalidateItemData(queryClient, itemId);
      return true;
    } catch (error) {
      setPhotoError(getItemErrorMessage(error));
      return false;
    } finally {
      setIsUploadingPhoto(false);
    }
  }

  const onSubmit = handleSubmit(async (values) => {
    // The item already exists (a previous photo upload failed): retry the photo.
    if (createdItemId) {
      if (await uploadStagedPhoto(createdItemId)) {
        onClose();
      }
      return;
    }

    createItem.mutate(
      {
        name: values.name,
        category: toNullableText(values.category),
        barcode: toNullableText(values.barcode),
        trackingType: parseTrackingType(values.trackingType),
        unit: isQuantity ? toNullableText(values.unit) : null,
        photoUrl: null,
      },
      {
        onSuccess: async (created) => {
          setCreatedItemId(created.id);
          if (await uploadStagedPhoto(created.id)) {
            onClose();
          }
        },
      },
    );
  });

  const submitLabel = isUploadingPhoto
    ? 'Uploading photo...'
    : createItem.isPending
      ? 'Creating...'
      : createdItemId
        ? 'Retry photo'
        : 'Create';

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

        {createdItemId && photoError ? (
          <Alert tone="warning">
            The item was created, but its photo failed to upload. Retry the photo
            or close and add it later.
          </Alert>
        ) : null}

        <ItemFormFields
          register={register}
          errors={errors}
          idPrefix="create-item"
          showUnit={isQuantity}
        />

        <div className="space-y-2 border-t border-slate-200 pt-4">
          <p className="text-sm font-medium text-slate-700">Photo</p>
          <p className="text-xs text-slate-500">Optional.</p>
          <ItemPhotoInput
            id={photoInputId}
            previewUrl={photoPreview}
            onSelect={setPhotoFile}
            error={photoError}
            disabled={isPending}
          />
        </div>

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isPending}>
            {submitLabel}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

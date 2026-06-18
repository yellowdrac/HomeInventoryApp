import { useId, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ChevronDownIcon, ChevronUpIcon } from '@/core/components/icons';
import { Alert, Button, Dialog, FormField, Input, Select } from '@/core/components/ui';
import { cn } from '@/core/lib/cn';
import { useObjectUrl } from '@/core/hooks/useObjectUrl';
import { useCreateItem } from '@features/Items/hooks/useCreateItem';
import { useUnits } from '@features/Items/hooks/useUnits';
import { itemsApi } from '@features/Items/api/itemsApi';
import { invalidateItemData } from '@features/Items/lib/itemQueries';
import { getItemErrorMessage } from '@features/Items/lib/itemErrors';
import {
  itemFormSchema,
  parseTrackingType,
  toNullableText,
  type ItemFormValues,
} from '@features/Items/schemas';
import { TrackingType, type UnitDto } from '@features/Items/types';
import { ItemPhotoInput } from '@features/Items/components/ItemPhotoInput';

interface CreateItemDialogProps {
  open: boolean;
  onClose: () => void;
}

function UnitSelect({
  units,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { units: UnitDto[] }) {
  const { t } = useTranslation();
  const categories = [...new Set(units.map((u) => u.category))];

  return (
    <select
      className="flex h-10 w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-colors focus-visible:border-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
      {...props}
    >
      <option value="">{t('itemForm.noUnit')}</option>
      {categories.map((cat) => (
        <optgroup key={cat} label={t(`units.categories.${cat}`, { defaultValue: cat })}>
          {units
            .filter((u) => u.category === cat)
            .map((u) => {
              const nameKey = `units.names.${u.symbol.replace(/\s+/g, '_')}`;
              return (
                <option key={u.id} value={u.id}>
                  {t(nameKey, { defaultValue: u.name })} ({u.symbol})
                </option>
              );
            })}
        </optgroup>
      ))}
    </select>
  );
}

export function CreateItemDialog({ open, onClose }: CreateItemDialogProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const createItem = useCreateItem();
  const { data: units = [] } = useUnits();
  const photoInputId = useId();

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [createdItemId, setCreatedItemId] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [showMore, setShowMore] = useState(false);

  const photoPreview = useObjectUrl(photoFile);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ItemFormValues>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: {
      name: '',
      category: '',
      barcode: '',
      trackingType: String(TrackingType.Quantity),
      unitId: '',
    },
  });

  const trackingTypeValue = watch('trackingType');
  const trackingType = parseTrackingType(trackingTypeValue);
  const isQuantity = trackingType === TrackingType.Quantity;
  const isPending = createItem.isPending || isUploadingPhoto;

  async function uploadStagedPhoto(itemId: string): Promise<boolean> {
    if (!photoFile) return true;
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
    if (createdItemId) {
      if (await uploadStagedPhoto(createdItemId)) onClose();
      return;
    }

    createItem.mutate(
      {
        name: values.name,
        category: toNullableText(values.category),
        barcode: toNullableText(values.barcode),
        trackingType: parseTrackingType(values.trackingType),
        unitId: isQuantity && values.unitId ? values.unitId : null,
        photoUrl: null,
        minimumQuantity: null,
      },
      {
        onSuccess: async (created) => {
          setCreatedItemId(created.id);
          if (await uploadStagedPhoto(created.id)) onClose();
        },
      },
    );
  });

  const submitLabel = isUploadingPhoto
    ? t('photo.uploading')
    : createItem.isPending
      ? t('common.creating')
      : createdItemId
        ? t('photo.retryPhoto')
        : t('common.create');

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t('items.addItem')}
      description={t('items.addItemDescription')}
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {createItem.isError ? (
          <Alert tone="error">{getItemErrorMessage(createItem.error)}</Alert>
        ) : null}

        {createdItemId && photoError ? (
          <Alert tone="warning">{t('photo.photoUploadWarning')}</Alert>
        ) : null}

        {/* Photo zone — at the top, compact */}
        <ItemPhotoInput
          id={photoInputId}
          previewUrl={photoPreview}
          onSelect={setPhotoFile}
          error={photoError}
          disabled={isPending}
        />

        {/* Name */}
        <FormField
          id="create-item-name"
          label={t('itemForm.name')}
          error={errors.name?.message}
        >
          {(aria) => (
            <Input
              placeholder={t('itemForm.namePlaceholder')}
              autoComplete="off"
              autoFocus
              {...aria}
              {...register('name')}
            />
          )}
        </FormField>

        {/* Tracking type — pill toggle */}
        <div className="space-y-1.5">
          <span className="text-sm font-medium text-slate-700">
            {t('itemForm.trackingType')}
          </span>
          <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1">
            {([TrackingType.Quantity, TrackingType.Unique] as const).map((tt) => {
              const active = trackingType === tt;
              return (
                <button
                  key={tt}
                  type="button"
                  onClick={() => setValue('trackingType', String(tt))}
                  className={cn(
                    'flex-1 rounded-md py-1.5 text-sm font-medium transition-all',
                    active
                      ? 'bg-white text-emerald-700 shadow-sm ring-1 ring-slate-200'
                      : 'text-slate-500 hover:text-slate-700',
                  )}
                >
                  {tt === TrackingType.Quantity
                    ? t('items.trackingTypeQuantity')
                    : t('items.trackingTypeUnique')}
                </button>
              );
            })}
          </div>
        </div>

        {/* Unit — only for quantity-tracked items */}
        {isQuantity ? (
          <FormField
            id="create-item-unit"
            label={t('itemForm.unit')}
            error={errors.unitId?.message}
          >
            {(aria) =>
              units.length > 0 ? (
                <UnitSelect units={units} {...aria} {...register('unitId')} />
              ) : (
                <Select {...aria} {...register('unitId')}>
                  <option value="">{t('itemForm.noUnit')}</option>
                </Select>
              )
            }
          </FormField>
        ) : null}

        {/* More options toggle */}
        <button
          type="button"
          onClick={() => setShowMore((v) => !v)}
          className="flex w-full items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          {showMore ? (
            <ChevronUpIcon className="size-4" aria-hidden="true" />
          ) : (
            <ChevronDownIcon className="size-4" aria-hidden="true" />
          )}
          {showMore ? t('itemForm.lessOptions') : t('itemForm.moreOptions')}
        </button>

        {showMore ? (
          <div className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3">
            <div className="flex-1">
              <FormField
                id="create-item-category"
                label={t('itemForm.category')}
                hint={t('common.optional')}
                error={errors.category?.message}
              >
                {(aria) => (
                  <Input
                    placeholder={t('itemForm.categoryPlaceholder')}
                    autoComplete="off"
                    {...aria}
                    {...register('category')}
                  />
                )}
              </FormField>
            </div>

            <div className="flex-1">
              <FormField
                id="create-item-barcode"
                label={t('itemForm.barcode')}
                hint={t('common.optional')}
                error={errors.barcode?.message}
              >
                {(aria) => (
                  <Input
                    placeholder={t('itemForm.barcodePlaceholder')}
                    autoComplete="off"
                    {...aria}
                    {...register('barcode')}
                  />
                )}
              </FormField>
            </div>
          </div>
        ) : null}

        {/* Actions */}
        <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" isLoading={isPending} className="sm:min-w-32">
            {submitLabel}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

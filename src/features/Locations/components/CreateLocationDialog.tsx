import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Alert, Button, Dialog } from '@/core/components/ui';
import { useCreateLocation } from '@features/Locations/hooks/useCreateLocation';
import { getLocationErrorMessage } from '@features/Locations/lib/locationErrors';
import {
  locationFormSchema,
  parseLocationType,
  type LocationFormValues,
} from '@features/Locations/schemas';
import { LocationType, type LocationTreeNode } from '@features/Locations/types';
import { LocationFormFields } from '@features/Locations/components/LocationFormFields';

interface CreateLocationDialogProps {
  open: boolean;
  onClose: () => void;
  /** Parent to create the location under; `null` creates a root location. */
  parent: LocationTreeNode | null;
}

/** Dialog to create a root location or a child of the given parent. */
export function CreateLocationDialog({
  open,
  onClose,
  parent,
}: CreateLocationDialogProps) {
  const { t } = useTranslation();
  const createLocation = useCreateLocation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LocationFormValues>({
    resolver: zodResolver(locationFormSchema),
    defaultValues: { name: '', type: String(LocationType.Room) },
  });

  const onSubmit = handleSubmit((values) => {
    createLocation.mutate(
      {
        name: values.name,
        type: parseLocationType(values.type),
        parentId: parent?.id ?? null,
      },
      { onSuccess: onClose },
    );
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={parent ? t('locationForm.addChildTitle', { name: parent.name }) : t('locationForm.addRootTitle')}
      description={t('locationForm.addDescription')}
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {createLocation.isError ? (
          <Alert tone="error">
            {getLocationErrorMessage(createLocation.error)}
          </Alert>
        ) : null}

        <LocationFormFields
          register={register}
          errors={errors}
          idPrefix="create-location"
        />

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" isLoading={createLocation.isPending}>
            {createLocation.isPending ? t('common.creating') : t('common.create')}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

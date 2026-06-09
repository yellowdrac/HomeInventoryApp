import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Button, Dialog } from '@/core/components/ui';
import { useUpdateLocation } from '@features/Locations/hooks/useUpdateLocation';
import { getLocationErrorMessage } from '@features/Locations/lib/locationErrors';
import {
  locationFormSchema,
  parseLocationType,
  type LocationFormValues,
} from '@features/Locations/schemas';
import type { LocationTreeNode } from '@features/Locations/types';
import { LocationFormFields } from '@features/Locations/components/LocationFormFields';

interface EditLocationDialogProps {
  open: boolean;
  onClose: () => void;
  node: LocationTreeNode;
}

/** Dialog to rename a location and change its type. */
export function EditLocationDialog({
  open,
  onClose,
  node,
}: EditLocationDialogProps) {
  const updateLocation = useUpdateLocation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LocationFormValues>({
    resolver: zodResolver(locationFormSchema),
    defaultValues: { name: node.name, type: String(node.type) },
  });

  const onSubmit = handleSubmit((values) => {
    updateLocation.mutate(
      {
        id: node.id,
        payload: { name: values.name, type: parseLocationType(values.type) },
      },
      { onSuccess: onClose },
    );
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Edit location"
      description="Update the name or type of this location."
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {updateLocation.isError ? (
          <Alert tone="error">
            {getLocationErrorMessage(updateLocation.error)}
          </Alert>
        ) : null}

        <LocationFormFields
          register={register}
          errors={errors}
          idPrefix="edit-location"
        />

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={updateLocation.isPending}>
            {updateLocation.isPending ? 'Saving...' : 'Save changes'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

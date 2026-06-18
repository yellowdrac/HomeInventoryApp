import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FormField, Input, Select } from '@/core/components/ui';
import {
  LOCATION_TYPE_VALUES,
  LOCATION_TYPE_LABELS,
} from '@features/Locations/types';
import type { LocationFormValues } from '@features/Locations/schemas';

interface LocationFormFieldsProps {
  register: UseFormRegister<LocationFormValues>;
  errors: FieldErrors<LocationFormValues>;
  /** Prefix for field ids so multiple dialogs never collide. */
  idPrefix: string;
}

/** Shared name + type fields used by the create and edit location dialogs. */
export function LocationFormFields({
  register,
  errors,
  idPrefix,
}: LocationFormFieldsProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      <FormField
        id={`${idPrefix}-name`}
        label={t('locationForm.name')}
        error={errors.name?.message}
      >
        {(aria) => (
          <Input
            placeholder={t('locationForm.namePlaceholder')}
            autoComplete="off"
            {...aria}
            {...register('name')}
          />
        )}
      </FormField>

      <FormField
        id={`${idPrefix}-type`}
        label={t('locationForm.type')}
        error={errors.type?.message}
      >
        {(aria) => (
          <Select {...aria} {...register('type')}>
            {LOCATION_TYPE_VALUES.map((value) => (
              <option key={value} value={value}>
                {LOCATION_TYPE_LABELS[value]}
              </option>
            ))}
          </Select>
        )}
      </FormField>
    </div>
  );
}

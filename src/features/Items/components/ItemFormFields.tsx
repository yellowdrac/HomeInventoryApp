import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import { FormField, Input, Select } from '@/core/components/ui';
import {
  TRACKING_TYPE_VALUES,
  TRACKING_TYPE_LABELS,
} from '@features/Items/types';
import type { ItemFormValues } from '@features/Items/schemas';

interface ItemFormFieldsProps {
  register: UseFormRegister<ItemFormValues>;
  errors: FieldErrors<ItemFormValues>;
  /** Prefix for field ids so multiple dialogs never collide. */
  idPrefix: string;
  /** Whether the item is quantity-tracked; controls the `unit` field. */
  showUnit: boolean;
}

/**
 * Shared fields for the create and edit item dialogs. The `unit` field is only
 * rendered for quantity-tracked items, since unique items are single pieces.
 */
export function ItemFormFields({
  register,
  errors,
  idPrefix,
  showUnit,
}: ItemFormFieldsProps) {
  return (
    <div className="space-y-4">
      <FormField
        id={`${idPrefix}-name`}
        label="Name"
        error={errors.name?.message}
      >
        {(aria) => (
          <Input
            placeholder="e.g. Olive oil"
            autoComplete="off"
            {...aria}
            {...register('name')}
          />
        )}
      </FormField>

      <FormField
        id={`${idPrefix}-category`}
        label="Category"
        hint="Optional"
        error={errors.category?.message}
      >
        {(aria) => (
          <Input
            placeholder="e.g. Pantry"
            autoComplete="off"
            {...aria}
            {...register('category')}
          />
        )}
      </FormField>

      <FormField
        id={`${idPrefix}-barcode`}
        label="Barcode"
        hint="Optional"
        error={errors.barcode?.message}
      >
        {(aria) => (
          <Input
            placeholder="e.g. 8412345678901"
            autoComplete="off"
            {...aria}
            {...register('barcode')}
          />
        )}
      </FormField>

      <FormField
        id={`${idPrefix}-trackingType`}
        label="Tracking type"
        error={errors.trackingType?.message}
      >
        {(aria) => (
          <Select {...aria} {...register('trackingType')}>
            {TRACKING_TYPE_VALUES.map((value) => (
              <option key={value} value={value}>
                {TRACKING_TYPE_LABELS[value]}
              </option>
            ))}
          </Select>
        )}
      </FormField>

      {showUnit ? (
        <FormField
          id={`${idPrefix}-unit`}
          label="Unit"
          hint="Optional, e.g. L, kg, units"
          error={errors.unit?.message}
        >
          {(aria) => (
            <Input
              placeholder="e.g. L"
              autoComplete="off"
              {...aria}
              {...register('unit')}
            />
          )}
        </FormField>
      ) : null}

      {showUnit ? (
        <FormField
          id={`${idPrefix}-minimumQuantity`}
          label="Low stock alert"
          hint="Optional — alert when stock drops below this"
          error={errors.minimumQuantity?.message}
        >
          {(aria) => (
            <Input
              type="number"
              min={0}
              step={1}
              placeholder="e.g. 2"
              autoComplete="off"
              {...aria}
              {...register('minimumQuantity')}
            />
          )}
        </FormField>
      ) : null}
    </div>
  );
}

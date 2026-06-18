import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FormField, Input, Select } from '@/core/components/ui';
import {
  TRACKING_TYPE_VALUES,
  TRACKING_TYPE_LABELS,
} from '@features/Items/types';
import type { UnitDto } from '@features/Items/types';
import type { ItemFormValues } from '@features/Items/schemas';

interface ItemFormFieldsProps {
  register: UseFormRegister<ItemFormValues>;
  errors: FieldErrors<ItemFormValues>;
  idPrefix: string;
  showUnit: boolean;
  units?: UnitDto[];
}

export function ItemFormFields({
  register,
  errors,
  idPrefix,
  showUnit,
  units = [],
}: ItemFormFieldsProps) {
  const { t } = useTranslation();
  const categories = [...new Set(units.map((u) => u.category))];

  return (
    <div className="space-y-4">
      <FormField
        id={`${idPrefix}-name`}
        label={t('itemForm.name')}
        error={errors.name?.message}
      >
        {(aria) => (
          <Input
            placeholder={t('itemForm.namePlaceholder')}
            autoComplete="off"
            {...aria}
            {...register('name')}
          />
        )}
      </FormField>

      <FormField
        id={`${idPrefix}-category`}
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

      <FormField
        id={`${idPrefix}-barcode`}
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

      <FormField
        id={`${idPrefix}-trackingType`}
        label={t('itemForm.trackingType')}
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
          label={t('itemForm.unit')}
          error={errors.unitId?.message}
        >
          {(aria) => (
            <Select {...aria} {...register('unitId')}>
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
            </Select>
          )}
        </FormField>
      ) : null}
    </div>
  );
}

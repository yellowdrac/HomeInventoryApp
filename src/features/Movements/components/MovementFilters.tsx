import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input, Label, Select } from '@/core/components/ui';
import { LocationPicker } from '@features/Locations/components/LocationPicker';
import { useItems } from '@features/Items/hooks/useItems';
import {
  MOVEMENT_TYPE_LABELS,
  MOVEMENT_TYPE_VALUES,
} from '@features/Movements/types';

/** Raw UI state of the movement filters (string-typed for native controls). */
export interface MovementFiltersValue {
  /** Item id, or `''` for all items. */
  itemId: string;
  /** Location id, or `''` for any location. */
  locationId: string;
  /** Movement type as a string, or `''` for all types. */
  type: string;
  /** `yyyy-mm-dd` lower bound, or `''`. */
  dateFrom: string;
  /** `yyyy-mm-dd` upper bound, or `''`. */
  dateTo: string;
}

interface MovementFiltersProps {
  value: MovementFiltersValue;
  onChange: (value: MovementFiltersValue) => void;
}

/** Filter bar for the movement history: item, type, date range and location. */
export function MovementFilters({ value, onChange }: MovementFiltersProps) {
  const { t } = useTranslation();
  const itemFilterId = useId();
  const typeFilterId = useId();
  const fromFilterId = useId();
  const toFilterId = useId();

  const { data: itemsPage } = useItems({ pageSize: 200 });
  const items = itemsPage?.items ?? [];

  const patch = (partial: Partial<MovementFiltersValue>) =>
    onChange({ ...value, ...partial });

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor={itemFilterId}>{t('movements.filterItem')}</Label>
          <Select
            id={itemFilterId}
            value={value.itemId}
            onChange={(event) => patch({ itemId: event.target.value })}
          >
            <option value="">{t('movements.allItems')}</option>
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={typeFilterId}>{t('movements.filterType')}</Label>
          <Select
            id={typeFilterId}
            value={value.type}
            onChange={(event) => patch({ type: event.target.value })}
          >
            <option value="">{t('movements.allTypes')}</option>
            {MOVEMENT_TYPE_VALUES.map((type) => (
              <option key={type} value={type}>
                {MOVEMENT_TYPE_LABELS[type]}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={fromFilterId}>{t('movements.filterFromDate')}</Label>
          <Input
            id={fromFilterId}
            type="date"
            value={value.dateFrom}
            max={value.dateTo || undefined}
            onChange={(event) => patch({ dateFrom: event.target.value })}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={toFilterId}>{t('movements.filterToDate')}</Label>
          <Input
            id={toFilterId}
            type="date"
            value={value.dateTo}
            min={value.dateFrom || undefined}
            onChange={(event) => patch({ dateTo: event.target.value })}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label>{t('movements.filterLocation')}</Label>
          {value.locationId ? (
            <Button
              type="button"
              variant="ghost"
              className="h-auto px-2 py-1 text-xs"
              onClick={() => patch({ locationId: '' })}
            >
              {t('common.clear')}
            </Button>
          ) : null}
        </div>
        <LocationPicker
          value={value.locationId || null}
          onChange={(locationId) => patch({ locationId })}
        />
      </div>
    </div>
  );
}

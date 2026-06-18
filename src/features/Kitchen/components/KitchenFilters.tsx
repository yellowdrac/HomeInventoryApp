import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Label, Select } from '@/core/components/ui';
import { LocationPicker } from '@features/Locations/components/LocationPicker';

/** Selectable warning windows (in days) for "expiring soon". */
export const WITHIN_DAYS_OPTIONS = [3, 7, 14, 30] as const;

interface KitchenFiltersProps {
  withinDays: number;
  onWithinDaysChange: (days: number) => void;
  /** Location subtree to scope to (the kitchen/pantry), or null for the home. */
  locationId: string | null;
  onLocationChange: (locationId: string | null) => void;
}

/**
 * Controls to scope the kitchen views: the "expiring soon" window and an
 * optional location subtree (reusing the existing location tree selector).
 */
export function KitchenFilters({
  withinDays,
  onWithinDaysChange,
  locationId,
  onLocationChange,
}: KitchenFiltersProps) {
  const { t } = useTranslation();
  const withinDaysId = useId();

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="space-y-1.5">
        <Label htmlFor={withinDaysId}>{t('kitchen.expiringWithin')}</Label>
        <Select
          id={withinDaysId}
          value={String(withinDays)}
          onChange={(event) => onWithinDaysChange(Number(event.target.value))}
        >
          {WITHIN_DAYS_OPTIONS.map((days) => (
            <option key={days} value={days}>
              {t('kitchen.nextDays', { days })}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label>{t('movements.filterLocation')}</Label>
          {locationId ? (
            <Button
              type="button"
              variant="ghost"
              className="h-auto px-2 py-1 text-xs"
              onClick={() => onLocationChange(null)}
            >
              {t('common.clear')}
            </Button>
          ) : null}
        </div>
        <LocationPicker
          value={locationId}
          onChange={(id) => onLocationChange(id)}
        />
      </div>
    </div>
  );
}

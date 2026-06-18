import { useTranslation } from 'react-i18next';
import { cn } from '@/core/lib/cn';
import { Alert } from '@/core/components/ui';
import { useLocationTree } from '@features/Locations/hooks/useLocationTree';
import { getLocationErrorMessage } from '@features/Locations/lib/locationErrors';
import { LocationTree } from '@features/Locations/components/LocationTree';

interface LocationPickerProps {
  /** Currently selected location id, or `null` when none is chosen. */
  value: string | null;
  onChange: (locationId: string) => void;
  /** Location ids that cannot be picked (e.g. the source of a move). */
  disabledIds?: Set<string> | undefined;
  /** Marks the control as invalid for `aria-invalid`/error styling. */
  invalid?: boolean;
  'aria-describedby'?: string | undefined;
}

/**
 * Location selector that reuses the existing accessible {@link LocationTree} in
 * read-only (no per-node menu) mode. Loads the household tree itself and
 * surfaces loading/empty/error states so callers only deal with the selected id.
 */
export function LocationPicker({
  value,
  onChange,
  disabledIds,
  invalid = false,
  'aria-describedby': describedBy,
}: LocationPickerProps) {
  const { t } = useTranslation();
  const { data, isPending, isError, error } = useLocationTree();

  return (
    <div
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      className={cn(
        'max-h-56 overflow-y-auto rounded-lg border bg-white p-1.5',
        invalid ? 'border-red-400' : 'border-slate-300',
      )}
    >
      {isPending ? (
        <div
          className="space-y-1.5 p-1"
          role="status"
          aria-busy="true"
          aria-label={t('locations.loadingLocations')}
        >
          {[0, 1, 2].map((row) => (
            <div
              key={row}
              className="h-8 animate-pulse rounded-md bg-slate-100"
              style={{ marginLeft: `${row * 1}rem` }}
            />
          ))}
        </div>
      ) : null}

      {isError ? (
        <Alert tone="error">{getLocationErrorMessage(error)}</Alert>
      ) : null}

      {data && data.length === 0 ? (
        <p className="px-2 py-3 text-sm text-slate-500">
          {t('locationContents.noLocationsYet')}
        </p>
      ) : null}

      {data && data.length > 0 ? (
        <LocationTree
          nodes={data}
          ariaLabel={t('locationTree.chooseLocation')}
          selectedId={value}
          onSelect={(node) => onChange(node.id)}
          disabledIds={disabledIds}
        />
      ) : null}
    </div>
  );
}

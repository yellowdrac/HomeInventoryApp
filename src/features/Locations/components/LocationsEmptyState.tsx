import { useTranslation } from 'react-i18next';
import { Button } from '@/core/components/ui';
import { HomeIcon, PlusIcon } from '@/core/components/icons';

interface LocationsEmptyStateProps {
  onCreateRoot: () => void;
}

/** Shown when the household has no locations yet; invites creating the first. */
export function LocationsEmptyState({ onCreateRoot }: LocationsEmptyStateProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        <HomeIcon className="size-6" />
      </span>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-slate-900">
          {t('locationsEmpty.title')}
        </h2>
        <p className="max-w-sm text-sm text-slate-600">
          {t('locationsEmpty.description')}
        </p>
      </div>
      <Button onClick={onCreateRoot}>
        <PlusIcon className="size-4" />
        {t('locationsEmpty.createFirst')}
      </Button>
    </div>
  );
}

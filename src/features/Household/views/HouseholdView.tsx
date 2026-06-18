import { useTranslation } from 'react-i18next';
import { Button, Alert } from '@/core/components/ui';
import { getHouseholdErrorMessage } from '@features/Household/lib/householdErrors';
import { useMyHousehold } from '@features/Household/hooks/useMyHousehold';
import { useRegenerateCode } from '@features/Household/hooks/useRegenerateCode';

/**
 * Shows the current household. Owners can regenerate the join code, which
 * invalidates the previous one.
 */
export function HouseholdView() {
  const { t } = useTranslation();
  const { data, isPending, isError, error } = useMyHousehold();
  const regenerate = useRegenerateCode();

  if (isPending) {
    return (
      <section className="mx-auto max-w-lg" aria-busy="true">
        <p className="text-slate-600">{t('household.loading')}</p>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="mx-auto max-w-lg">
        <Alert tone="error">{getHouseholdErrorMessage(error)}</Alert>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-lg space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">{data.name}</h1>
        <p className="text-sm text-slate-600">
          {data.isOwner ? t('household.youOwn') : t('household.youAreMember')}
        </p>
      </div>

      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-700">{t('household.joinCode')}</p>
          <p className="font-mono text-2xl tracking-widest text-slate-900">
            {data.joinCode}
          </p>
          <p className="text-xs text-slate-500">
            {t('household.shareCode')}
          </p>
        </div>

        {regenerate.isError ? (
          <Alert tone="error">{getHouseholdErrorMessage(regenerate.error)}</Alert>
        ) : null}

        {data.isOwner ? (
          <Button
            variant="secondary"
            onClick={() => regenerate.mutate()}
            isLoading={regenerate.isPending}
          >
            {regenerate.isPending ? t('household.regenerating') : t('household.regenerateCode')}
          </Button>
        ) : null}
      </div>
    </section>
  );
}

import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ArrowRightIcon } from '@/core/components/icons';
import { useDashboard } from '@features/Dashboard/hooks/useDashboard';
import { DashboardSummaryCards } from '@features/Dashboard/components/DashboardSummaryCards';
import { QuickActions } from '@features/Dashboard/components/QuickActions';
import { RecentMovements } from '@features/Dashboard/components/RecentMovements';

/**
 * Authenticated landing page. Surfaces household-wide counts, shortcuts to the
 * common tasks and the latest activity. The app shell/header is provided by the
 * protected layout.
 */
export function DashboardView() {
  const { t } = useTranslation();
  const {
    summary,
    recentMovements,
    expiringWindowDays,
    isSummaryLoading,
    isMovementsLoading,
    isMovementsError,
    movementsError,
  } = useDashboard();

  return (
    <section className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {t('dashboard.title')}
        </h1>
        <p className="text-slate-600">
          {t('dashboard.description')}
        </p>
      </header>

      <DashboardSummaryCards
        summary={summary}
        expiringWindowDays={expiringWindowDays}
        isLoading={isSummaryLoading}
      />

      <QuickActions />

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">
            {t('dashboard.recentMovements')}
          </h2>
          <Link
            to="/movements"
            className="inline-flex items-center gap-1 rounded-md text-sm font-medium text-emerald-700 transition-colors hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
          >
            {t('dashboard.viewAll')}
            <ArrowRightIcon className="size-4" aria-hidden="true" />
          </Link>
        </div>
        <RecentMovements
          movements={recentMovements}
          isLoading={isMovementsLoading}
          isError={isMovementsError}
          error={movementsError}
        />
      </div>
    </section>
  );
}

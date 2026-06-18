import { useTranslation } from 'react-i18next';
import { AlertTriangleIcon, ClockIcon } from '@/core/components/icons';
import { cn } from '@/core/lib/cn';
import type { KitchenOverview } from '@features/Kitchen/types';

interface KitchenSummaryCardsProps {
  overview: KitchenOverview | undefined;
  withinDays: number;
  isLoading: boolean;
}

/** Top-of-page summary: expired and expiring-soon counts. */
export function KitchenSummaryCards({
  overview,
  withinDays,
  isLoading,
}: KitchenSummaryCardsProps) {
  const { t } = useTranslation();
  if (isLoading) {
    return (
      <div
        className="grid gap-3 sm:grid-cols-2"
        role="status"
        aria-busy="true"
        aria-label={t('kitchen.loadingSummary')}
      >
        {[0, 1].map((card) => (
          <div
            key={card}
            className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-slate-100"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <SummaryCard
        label={t('kitchen.expired')}
        count={overview?.expiredCount ?? 0}
        icon={<AlertTriangleIcon className="size-5" />}
        tone="bg-red-50 text-red-700"
      />
      <SummaryCard
        label={t('kitchen.expiringSoon', { days: withinDays })}
        count={overview?.expiringSoonCount ?? 0}
        icon={<ClockIcon className="size-5" />}
        tone="bg-amber-50 text-amber-700"
      />
    </div>
  );
}

interface SummaryCardProps {
  label: string;
  count: number;
  icon: React.ReactNode;
  tone: string;
}

function SummaryCard({ label, count, icon, tone }: SummaryCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <span
        className={cn(
          'flex size-11 shrink-0 items-center justify-center rounded-xl',
          tone,
        )}
        aria-hidden="true"
      >
        {icon}
      </span>
      <div>
        <p className="text-2xl font-bold tracking-tight text-slate-900">
          {count}
        </p>
        <p className="text-sm text-slate-600">{label}</p>
      </div>
    </div>
  );
}

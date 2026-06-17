import { Link } from 'react-router';
import {
  AlertTriangleIcon,
  ClockIcon,
  MapPinIcon,
  PackageIcon,
  TrendingDownIcon,
} from '@/core/components/icons';
import { cn } from '@/core/lib/cn';
import type { DashboardSummary } from '@features/Dashboard/hooks/useDashboard';

interface DashboardSummaryCardsProps {
  summary: DashboardSummary;
  /** Warning window used for the "expiring soon" caption. */
  expiringWindowDays: number;
  isLoading: boolean;
}

/** Top-of-page summary: total items, locations, perishable counts, and low-stock count. */
export function DashboardSummaryCards({
  summary,
  expiringWindowDays,
  isLoading,
}: DashboardSummaryCardsProps) {
  if (isLoading) {
    return (
      <div
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
        role="status"
        aria-busy="true"
        aria-label="Loading summary"
      >
        {[0, 1, 2, 3, 4].map((card) => (
          <div
            key={card}
            className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-slate-100"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <SummaryCard
        label="Items"
        count={summary.itemCount}
        icon={<PackageIcon className="size-5" />}
        tone="bg-emerald-50 text-emerald-700"
      />
      <SummaryCard
        label="Locations"
        count={summary.locationCount}
        icon={<MapPinIcon className="size-5" />}
        tone="bg-sky-50 text-sky-700"
      />
      <SummaryCard
        label="Running low"
        count={summary.lowStockCount}
        icon={<TrendingDownIcon className="size-5" />}
        tone="bg-violet-50 text-violet-700"
        href="/items?lowStock=true"
      />
      <SummaryCard
        label={`Expiring soon (next ${expiringWindowDays} days)`}
        count={summary.expiringSoonCount}
        icon={<ClockIcon className="size-5" />}
        tone="bg-amber-50 text-amber-700"
      />
      <SummaryCard
        label="Expired"
        count={summary.expiredCount}
        icon={<AlertTriangleIcon className="size-5" />}
        tone="bg-red-50 text-red-700"
      />
    </div>
  );
}

interface SummaryCardProps {
  label: string;
  count: number;
  icon: React.ReactNode;
  tone: string;
  href?: string;
}

function SummaryCard({ label, count, icon, tone, href }: SummaryCardProps) {
  const inner = (
    <>
      <span
        className={cn(
          'flex size-11 shrink-0 items-center justify-center rounded-xl',
          tone,
        )}
        aria-hidden="true"
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-2xl font-bold tracking-tight text-slate-900">
          {count}
        </p>
        <p className="truncate text-sm text-slate-600">{label}</p>
      </div>
    </>
  );

  if (href) {
    return (
      <Link
        to={href}
        className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-violet-300 hover:bg-violet-50/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
      >
        {inner}
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      {inner}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Alert, Button } from '@/core/components/ui';
import {
  ArrowRightIcon,
  ClockIcon,
  MapPinIcon,
  UserIcon,
} from '@/core/components/icons';
import { useMovements } from '@features/Movements/hooks/useMovements';
import { getMovementErrorMessage } from '@features/Movements/lib/movementErrors';
import { formatDateTime } from '@features/Movements/lib/format';
import { MovementTypeBadge } from '@features/Movements/components/MovementTypeBadge';
import type { GetMovementsParams, Movement } from '@features/Movements/types';

interface MovementsListProps {
  /** Active filters; `page`/`pageSize` are managed internally. */
  filters?: Omit<GetMovementsParams, 'page' | 'pageSize'>;
  /** Whether item rows link to the item detail page. */
  linkItems?: boolean;
  /** Accessible label for the list. */
  ariaLabel?: string;
  pageSize?: number;
}

/**
 * Renders the household's movement history for the given filters: a newest-first
 * list with loading, empty and error states, plus simple pagination. Reused by
 * the standalone history page and the per-item history section.
 */
export function MovementsList({
  filters = {},
  linkItems = true,
  ariaLabel = 'Movements',
  pageSize = 20,
}: MovementsListProps) {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);

  // Reset to the first page whenever the filters change.
  const filtersKey = JSON.stringify(filters);
  useEffect(() => {
    setPage(1);
  }, [filtersKey]);

  const { data, isPending, isError, error, isPlaceholderData } = useMovements({
    ...filters,
    page,
    pageSize,
  });

  if (isPending) {
    return <MovementsSkeleton />;
  }

  if (isError) {
    return <Alert tone="error">{getMovementErrorMessage(error)}</Alert>;
  }

  const movements = data?.items ?? [];

  if (movements.length === 0) {
    return (
      <p
        className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-10 text-center text-sm text-slate-600"
        role="status"
      >
        {t('movements.noMovements')}
      </p>
    );
  }

  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="space-y-4">
      <ul
        className="space-y-2"
        aria-label={ariaLabel}
        aria-busy={isPlaceholderData || undefined}
      >
        {movements.map((movement) => (
          <li key={movement.id}>
            <MovementRow movement={movement} linkItem={linkItems} />
          </li>
        ))}
      </ul>

      {totalPages > 1 ? (
        <nav
          className="flex items-center justify-between gap-3"
          aria-label={t('movements.pagination')}
        >
          <Button
            variant="secondary"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            {t('common.previous')}
          </Button>
          <span className="text-sm text-slate-600" aria-live="polite">
            {t('movements.pageOf', { page, totalPages })}
          </span>
          <Button
            variant="secondary"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            {t('common.next')}
          </Button>
        </nav>
      ) : null}
    </div>
  );
}

interface MovementRowProps {
  movement: Movement;
  linkItem: boolean;
}

/** A single movement entry as a responsive card. */
function MovementRow({ movement, linkItem }: MovementRowProps) {
  const itemNameNode = linkItem ? (
    <Link
      to={`/items/${movement.itemId}`}
      className="truncate font-semibold text-slate-900 transition-colors hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 rounded"
    >
      {movement.itemName}
    </Link>
  ) : (
    <span className="truncate font-semibold text-slate-900">
      {movement.itemName}
    </span>
  );

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          {itemNameNode}
          <MovementTypeBadge type={movement.type} />
        </div>
        <span className="shrink-0 text-sm font-semibold text-slate-900">
          {movement.quantity}
        </span>
      </div>

      <MovementPath movement={movement} />

      {movement.reason ? (
        <p className="mt-1 text-sm text-slate-600">{movement.reason}</p>
      ) : null}

      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
        {movement.performedByDisplayName ? (
          <span className="inline-flex items-center gap-1">
            <UserIcon className="size-3.5" />
            {movement.performedByDisplayName}
          </span>
        ) : null}
        <span className="inline-flex items-center gap-1">
          <ClockIcon className="size-3.5" />
          <time dateTime={movement.occurredAt}>
            {formatDateTime(movement.occurredAt)}
          </time>
        </span>
      </div>
    </article>
  );
}

/** Renders the source → destination of a movement, omitting absent ends. */
function MovementPath({ movement }: { movement: Movement }) {
  const { fromLocationName, toLocationName } = movement;
  if (!fromLocationName && !toLocationName) {
    return null;
  }

  return (
    <p className="mt-1 flex flex-wrap items-center gap-1.5 text-sm text-slate-700">
      <MapPinIcon className="size-4 shrink-0 text-slate-400" />
      {fromLocationName ? <span>{fromLocationName}</span> : null}
      {fromLocationName && toLocationName ? (
        <ArrowRightIcon className="size-4 shrink-0 text-slate-400" />
      ) : null}
      {toLocationName ? <span>{toLocationName}</span> : null}
    </p>
  );
}

/** Accessible loading placeholder for the movement list. */
function MovementsSkeleton() {
  const { t } = useTranslation();
  return (
    <div
      className="space-y-2"
      role="status"
      aria-busy="true"
      aria-label={t('movements.loadingMovements')}
    >
      {[0, 1, 2, 3].map((row) => (
        <div
          key={row}
          className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-slate-100"
        />
      ))}
    </div>
  );
}

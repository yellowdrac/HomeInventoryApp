import { Link } from 'react-router';
import { Alert } from '@/core/components/ui';
import { ClockIcon } from '@/core/components/icons';
import { MovementTypeBadge } from '@features/Movements/components/MovementTypeBadge';
import { getMovementErrorMessage } from '@features/Movements/lib/movementErrors';
import { formatDateTime } from '@features/Movements/lib/format';
import type { Movement } from '@features/Movements/types';

interface RecentMovementsProps {
  movements: Movement[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
}

/**
 * Compact, read-only list of the latest movements for the dashboard. Unlike the
 * full history page it has no filters or pagination; each row links to its item.
 */
export function RecentMovements({
  movements,
  isLoading,
  isError,
  error,
}: RecentMovementsProps) {
  if (isLoading) {
    return (
      <div
        className="space-y-2"
        role="status"
        aria-busy="true"
        aria-label="Loading recent movements"
      >
        {[0, 1, 2].map((row) => (
          <div
            key={row}
            className="h-14 animate-pulse rounded-2xl border border-slate-200 bg-slate-100"
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return <Alert tone="error">{getMovementErrorMessage(error)}</Alert>;
  }

  if (movements.length === 0) {
    return (
      <p
        className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-10 text-center text-sm text-slate-600"
        role="status"
      >
        No movements recorded yet.
      </p>
    );
  }

  return (
    <ul className="space-y-2" aria-label="Recent movements">
      {movements.map((movement) => (
        <li
          key={movement.id}
          className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
        >
          <div className="flex min-w-0 items-center gap-2">
            <Link
              to={`/items/${movement.itemId}`}
              className="truncate font-semibold text-slate-900 transition-colors hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 rounded"
            >
              {movement.itemName}
            </Link>
            <MovementTypeBadge type={movement.type} />
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="font-semibold text-slate-900">
              {movement.quantity}
            </span>
            <span className="inline-flex items-center gap-1">
              <ClockIcon className="size-3.5" />
              <time dateTime={movement.occurredAt}>
                {formatDateTime(movement.occurredAt)}
              </time>
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}

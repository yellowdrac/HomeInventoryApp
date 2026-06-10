import { useMemo, useState } from 'react';
import { ClockIcon } from '@/core/components/icons';
import { dayEndIso, dayStartIso } from '@features/Movements/lib/format';
import {
  MovementFilters,
  type MovementFiltersValue,
} from '@features/Movements/components/MovementFilters';
import { MovementsList } from '@features/Movements/components/MovementsList';
import type {
  GetMovementsParams,
  MovementType,
} from '@features/Movements/types';

const EMPTY_FILTERS: MovementFiltersValue = {
  itemId: '',
  locationId: '',
  type: '',
  dateFrom: '',
  dateTo: '',
};

/**
 * Movements page: the household's full stock history, newest first, with
 * filters by item, type, date range and location. The app shell/header comes
 * from the protected layout.
 */
export function MovementsView() {
  const [filters, setFilters] = useState<MovementFiltersValue>(EMPTY_FILTERS);

  const queryFilters = useMemo<
    Omit<GetMovementsParams, 'page' | 'pageSize'>
  >(() => {
    const dateFrom = dayStartIso(filters.dateFrom);
    const dateTo = dayEndIso(filters.dateTo);
    return {
      ...(filters.itemId ? { itemId: filters.itemId } : {}),
      ...(filters.locationId ? { locationId: filters.locationId } : {}),
      ...(filters.type
        ? { type: Number(filters.type) as MovementType }
        : {}),
      ...(dateFrom ? { dateFrom } : {}),
      ...(dateTo ? { dateTo } : {}),
    };
  }, [filters]);

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
          <ClockIcon className="size-7 text-slate-400" />
          History
        </h1>
        <p className="text-sm text-slate-600">
          Every move, consumption and adjustment across your home.
        </p>
      </header>

      <MovementFilters value={filters} onChange={setFilters} />

      <MovementsList filters={queryFilters} ariaLabel="Movement history" />
    </section>
  );
}

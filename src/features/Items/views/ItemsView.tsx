import { useId, useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Alert, Button, Input, Label } from '@/core/components/ui';
import {
  ChevronRightIcon,
  PackageIcon,
  PlusIcon,
  SearchIcon,
} from '@/core/components/icons';
import { useDebouncedValue } from '@/core/hooks/useDebouncedValue';
import { useItems } from '@features/Items/hooks/useItems';
import { getItemErrorMessage } from '@features/Items/lib/itemErrors';
import { formatQuantity } from '@features/Items/lib/format';
import { TrackingTypeBadge } from '@features/Items/components/TrackingTypeBadge';
import { ItemsEmptyState } from '@features/Items/components/ItemsEmptyState';
import { CreateItemDialog } from '@features/Items/components/CreateItemDialog';
import type { Item } from '@features/Items/types';

/**
 * Items page: a searchable list of the household's catalog. The text filter is
 * debounced and queried server-side. The app shell/header comes from the
 * protected layout.
 */
export function ItemsView() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [isCreateOpen, setCreateOpen] = useState(false);
  const searchId = useId();

  const nameFilter = useDebouncedValue(search.trim(), 300);
  const { data, isPending, isError, error, isPlaceholderData } = useItems(
    nameFilter ? { nameFilter } : {},
  );

  const items = data?.items ?? [];
  const hasFilter = nameFilter.length > 0;

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {t('items.title')}
          </h1>
          <p className="text-sm text-slate-600">
            {t('items.description')}
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <PlusIcon className="size-4" />
          {t('items.addItem')}
        </Button>
      </header>

      <div className="relative">
        <Label htmlFor={searchId} className="sr-only">
          {t('items.searchLabel')}
        </Label>
        <SearchIcon
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
        />
        <Input
          id={searchId}
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t('items.searchPlaceholder')}
          autoComplete="off"
          className="pl-9"
        />
      </div>

      {isError ? (
        <Alert tone="error">{getItemErrorMessage(error)}</Alert>
      ) : null}

      {isPending ? <ItemsSkeleton /> : null}

      {!isPending && !isError && items.length === 0 ? (
        hasFilter ? (
          <p
            className="rounded-2xl border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-600"
            role="status"
          >
            {t('items.noItemsMatch', { query: nameFilter })}
          </p>
        ) : (
          <ItemsEmptyState onCreate={() => setCreateOpen(true)} />
        )
      ) : null}

      {!isPending && items.length > 0 ? (
        <ul
          className="space-y-2"
          aria-busy={isPlaceholderData || undefined}
          aria-label={t('items.itemsLabel')}
        >
          {items.map((item) => (
            <li key={item.id}>
              <ItemRow item={item} />
            </li>
          ))}
        </ul>
      ) : null}

      {isCreateOpen ? (
        <CreateItemDialog open onClose={() => setCreateOpen(false)} />
      ) : null}
    </section>
  );
}

/** A single tappable item row linking to its detail page. */
function ItemRow({ item }: { item: Item }) {
  return (
    <Link
      to={`/items/${item.id}`}
      className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition-colors hover:border-emerald-300 hover:bg-emerald-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 sm:p-4"
    >
      {item.photoUrl ? (
        <img
          src={item.photoUrl}
          alt=""
          className="size-10 shrink-0 rounded-lg object-cover"
        />
      ) : (
        <span
          className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500"
          aria-hidden="true"
        >
          <PackageIcon className="size-5" />
        </span>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold text-slate-900">
            {item.name}
          </p>
          <TrackingTypeBadge type={item.trackingType} />
        </div>
        {item.category ? (
          <p className="truncate text-xs text-slate-500">{item.category}</p>
        ) : null}
      </div>

      <span className="shrink-0 text-sm font-semibold text-slate-900">
        {formatQuantity(item.totalQuantity, item.unit)}
      </span>
      <ChevronRightIcon className="size-5 shrink-0 text-slate-400" />
    </Link>
  );
}

/** Accessible loading placeholder for the items list. */
function ItemsSkeleton() {
  const { t } = useTranslation();
  return (
    <div
      className="space-y-2"
      role="status"
      aria-busy="true"
      aria-label={t('items.loadingItems')}
    >
      {[0, 1, 2, 3].map((row) => (
        <div
          key={row}
          className="h-[68px] animate-pulse rounded-2xl border border-slate-200 bg-slate-100"
        />
      ))}
    </div>
  );
}

import { ClockIcon } from '@/core/components/icons';
import { MovementsList } from '@features/Movements/components/MovementsList';

interface ItemHistoryProps {
  itemId: string;
}

/**
 * "History" section for the item detail page: the movement history filtered to
 * this item. Item rows do not re-link to the item the user is already viewing.
 */
export function ItemHistory({ itemId }: ItemHistoryProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
        <ClockIcon className="size-5 text-slate-400" />
        History
      </h2>
      <div className="mt-4">
        <MovementsList
          filters={{ itemId }}
          linkItems={false}
          ariaLabel="Item history"
        />
      </div>
    </section>
  );
}

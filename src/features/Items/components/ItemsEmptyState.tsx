import { Button } from '@/core/components/ui';
import { PackageIcon, PlusIcon } from '@/core/components/icons';

interface ItemsEmptyStateProps {
  onCreate: () => void;
}

/** Friendly empty state shown when the household has no items yet. */
export function ItemsEmptyState({ onCreate }: ItemsEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <span
        className="flex size-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"
        aria-hidden="true"
      >
        <PackageIcon className="size-6" />
      </span>
      <h2 className="mt-4 text-lg font-semibold text-slate-900">
        No items yet
      </h2>
      <p className="mt-1 max-w-sm text-sm text-slate-600">
        Add the products you keep at home to start tracking where they live and
        how much you have.
      </p>
      <Button className="mt-6" onClick={onCreate}>
        <PlusIcon className="size-4" />
        Add item
      </Button>
    </div>
  );
}

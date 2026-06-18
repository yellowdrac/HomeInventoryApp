import { useItems } from './useItems';

/** Returns the count of items whose total quantity is below their minimumQuantity threshold. */
export function useLowStockCount() {
  const { data, isPending } = useItems({ belowMinimum: true, page: 1, pageSize: 1 });
  return { count: data?.totalCount ?? 0, isPending };
}

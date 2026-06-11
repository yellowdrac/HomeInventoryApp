import { useQuery } from '@tanstack/react-query';
import { locationsApi } from '@features/Locations/api/locationsApi';

export const printableLocationsQueryKey = (locationId: string | null) =>
  ['locations', 'printable', locationId] as const;

/**
 * Lists the household's locations as printable QR labels. When `locationId` is
 * set, the list is scoped to that location and all of its descendants.
 */
export function usePrintableLocations(locationId: string | null) {
  return useQuery({
    queryKey: printableLocationsQueryKey(locationId),
    queryFn: () => locationsApi.getPrintable(locationId ?? undefined),
  });
}

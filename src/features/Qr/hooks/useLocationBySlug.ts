import { useQuery } from '@tanstack/react-query';
import { locationsApi } from '@features/Locations/api/locationsApi';

export const locationBySlugQueryKey = (slug: string) =>
  ['locations', 'by-slug', slug] as const;

/**
 * Resolves a QR slug to its location (detail + contents) within the household.
 * Disabled until a slug is provided. A slug from another household resolves to a
 * 404 from the backend, surfaced through `isError`.
 */
export function useLocationBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: locationBySlugQueryKey(slug ?? ''),
    queryFn: () => locationsApi.getBySlug(slug!),
    enabled: Boolean(slug),
    retry: false,
  });
}

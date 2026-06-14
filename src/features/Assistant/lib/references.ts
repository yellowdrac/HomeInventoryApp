import { ReferenceType, type ChatReference } from '@features/Assistant/types';

/**
 * Resolves a cited entity to an existing in-app route: items go to their detail
 * page, locations to the locations tree focused on the node. Reuses the same
 * URLs the rest of the app links to.
 */
export function referenceHref(reference: ChatReference): string {
  switch (reference.type) {
    case ReferenceType.Item:
      return `/items/${encodeURIComponent(reference.id)}`;
    case ReferenceType.Location:
      return `/locations?location=${encodeURIComponent(reference.id)}`;
    default:
      return '/';
  }
}

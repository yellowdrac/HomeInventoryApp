import { createElement } from 'react';
import type { RouteObject } from 'react-router';
import { ItemsView } from '@features/Items/views/ItemsView';
import { ItemDetailView } from '@features/Items/views/ItemDetailView';

/**
 * Items routes. Require an existing household (aggregated under the household
 * guard in the central router).
 */
export const itemsRoutes: RouteObject[] = [
  { path: '/items', element: createElement(ItemsView) },
  { path: '/items/:id', element: createElement(ItemDetailView) },
];

import { createElement } from 'react';
import type { RouteObject } from 'react-router';
import { KitchenView } from '@features/Kitchen/views/KitchenView';

/**
 * Kitchen routes. Require an existing household (aggregated under the household
 * guard in the central router).
 */
export const kitchenRoutes: RouteObject[] = [
  { path: '/kitchen', element: createElement(KitchenView) },
];

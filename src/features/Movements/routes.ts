import { createElement } from 'react';
import type { RouteObject } from 'react-router';
import { MovementsView } from '@features/Movements/views/MovementsView';

/**
 * Movements routes. Require an existing household (aggregated under the
 * household guard in the central router).
 */
export const movementsRoutes: RouteObject[] = [
  { path: '/movements', element: createElement(MovementsView) },
];

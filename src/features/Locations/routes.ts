import { createElement } from 'react';
import type { RouteObject } from 'react-router';
import { LocationsView } from '@features/Locations/views/LocationsView';

/**
 * Locations routes. Require an existing household (aggregated under the
 * household guard in the central router).
 */
export const locationsRoutes: RouteObject[] = [
  { path: '/locations', element: createElement(LocationsView) },
];

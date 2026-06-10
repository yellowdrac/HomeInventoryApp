import { createElement } from 'react';
import type { RouteObject } from 'react-router';
import { SearchView } from '@features/Search/views/SearchView';

/**
 * Search routes. Require an existing household (aggregated under the household
 * guard in the central router).
 */
export const searchRoutes: RouteObject[] = [
  { path: '/search', element: createElement(SearchView) },
];

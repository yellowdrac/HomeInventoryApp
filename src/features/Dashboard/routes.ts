import { createElement } from 'react';
import type { RouteObject } from 'react-router';
import { DashboardView } from '@features/Dashboard/views/DashboardView';

/**
 * Dashboard routes. The dashboard is the default landing page (`/`) for the
 * authenticated area; it requires an existing household (aggregated under the
 * household guard in the central router).
 */
export const dashboardRoutes: RouteObject[] = [
  { path: '/', element: createElement(DashboardView) },
];

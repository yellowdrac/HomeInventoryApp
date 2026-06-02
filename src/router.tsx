import { useRoutes, type RouteObject } from 'react-router';
import { welcomeRoutes } from '@features/Welcome/routes';

/**
 * Aggregated route table. Each feature exports its own routes; add them here.
 */
const routes: RouteObject[] = [
  ...welcomeRoutes,
  // Fallback: redirect unknown paths to the Welcome view for now.
  { path: '*', element: welcomeRoutes[0]?.element },
];

export function AppRoutes() {
  return useRoutes(routes);
}

import { createElement } from 'react';
import type { RouteObject } from 'react-router';
import { WelcomeView } from '@features/Welcome/views/WelcomeView';

/**
 * Routes contributed by the Welcome feature. Each feature owns its own
 * `routes.ts` and the central router aggregates them. `createElement` is used
 * (instead of JSX) so this stays a plain `.ts` module.
 */
export const welcomeRoutes: RouteObject[] = [
  {
    path: '/',
    element: createElement(WelcomeView),
  },
];

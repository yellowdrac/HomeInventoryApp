import { createElement } from 'react';
import { Navigate, useRoutes, type RouteObject } from 'react-router';
import {
  PublicOnlyRoute,
  RequireAuth,
  RequireHousehold,
} from '@/core/auth/guards';
import { ProtectedLayout } from '@/core/auth/ProtectedLayout';
import { welcomeRoutes } from '@features/Welcome/routes';
import { authRoutes } from '@features/Auth/routes';
import {
  householdRoutes,
  householdSetupRoutes,
} from '@features/Household/routes';
import { locationsRoutes } from '@features/Locations/routes';
import { itemsRoutes } from '@features/Items/routes';
import { movementsRoutes } from '@features/Movements/routes';
import { searchRoutes } from '@features/Search/routes';

/**
 * Aggregated route table.
 *
 * Layering:
 *  - Public-only routes (login/register): redirected away once authenticated.
 *  - Authenticated area (ProtectedLayout): requires a session.
 *      - Household setup: reachable without a household.
 *      - Everything else: requires an existing household.
 */
const routes: RouteObject[] = [
  {
    element: createElement(PublicOnlyRoute),
    children: [...authRoutes],
  },
  {
    element: createElement(RequireAuth),
    children: [
      {
        element: createElement(ProtectedLayout),
        children: [
          ...householdSetupRoutes,
          {
            element: createElement(RequireHousehold),
            children: [
              ...welcomeRoutes,
              ...householdRoutes,
              ...locationsRoutes,
              ...itemsRoutes,
              ...movementsRoutes,
              ...searchRoutes,
            ],
          },
        ],
      },
    ],
  },
  // Unknown paths fall back to the app root (guards redirect as appropriate).
  { path: '*', element: createElement(Navigate, { to: '/', replace: true }) },
];

export function AppRoutes() {
  return useRoutes(routes);
}

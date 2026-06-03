import { createElement } from 'react';
import type { RouteObject } from 'react-router';
import { HouseholdSetupView } from '@features/Household/views/HouseholdSetupView';
import { HouseholdView } from '@features/Household/views/HouseholdView';

/**
 * Setup route: reachable by an authenticated user who has no household yet.
 * Aggregated under the auth guard but outside the "requires household" guard.
 */
export const householdSetupRoutes: RouteObject[] = [
  { path: '/household/setup', element: createElement(HouseholdSetupView) },
];

/**
 * Household routes that require the user to already belong to a household.
 */
export const householdRoutes: RouteObject[] = [
  { path: '/household', element: createElement(HouseholdView) },
];

import { createElement } from 'react';
import type { RouteObject } from 'react-router';
import { LoginView } from '@features/Auth/views/LoginView';
import { RegisterView } from '@features/Auth/views/RegisterView';

/**
 * Public routes contributed by the Auth feature. Aggregated by the central
 * router under the "public only" guard (authenticated users are redirected away).
 */
export const authRoutes: RouteObject[] = [
  { path: '/login', element: createElement(LoginView) },
  { path: '/register', element: createElement(RegisterView) },
];

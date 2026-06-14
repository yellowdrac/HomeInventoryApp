import { createElement } from 'react';
import type { RouteObject } from 'react-router';
import { AssistantView } from '@features/Assistant/views/AssistantView';

/**
 * Assistant routes. Require an existing household (aggregated under the
 * household guard in the central router).
 */
export const assistantRoutes: RouteObject[] = [
  { path: '/assistant', element: createElement(AssistantView) },
];

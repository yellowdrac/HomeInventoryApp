import { createElement } from 'react';
import type { RouteObject } from 'react-router';
import { NotificationSettingsView } from '@features/Notifications/views/NotificationSettingsView';

export const notificationsRoutes: RouteObject[] = [
  {
    path: '/notifications',
    element: createElement(NotificationSettingsView),
  },
];

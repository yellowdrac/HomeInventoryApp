import { useQuery } from '@tanstack/react-query';
import { notificationsApi } from '../api/notificationsApi';

export const notificationSettingsQueryKey = [
  'notifications',
  'settings',
] as const;

export function useNotificationSettings() {
  return useQuery({
    queryKey: notificationSettingsQueryKey,
    queryFn: () => notificationsApi.getSettings(),
  });
}

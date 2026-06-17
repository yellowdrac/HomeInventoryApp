import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '../api/notificationsApi';
import { notificationSettingsQueryKey } from './useNotificationSettings';

export function useUpdateNotificationSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationsApi.updateSettings,
    onSuccess: (data) => {
      queryClient.setQueryData(notificationSettingsQueryKey, data);
    },
  });
}

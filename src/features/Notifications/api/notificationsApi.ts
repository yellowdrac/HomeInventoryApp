import { apiClient } from '@/core/api/client';
import type { NotificationSettings, PushSubscriptionDto } from '../types';

export const notificationsApi = {
  async getSettings(): Promise<NotificationSettings> {
    const { data } = await apiClient.get<NotificationSettings>(
      '/api/notifications/settings',
    );
    return data;
  },

  async updateSettings(
    payload: NotificationSettings,
  ): Promise<NotificationSettings> {
    const { data } = await apiClient.put<NotificationSettings>(
      '/api/notifications/settings',
      payload,
    );
    return data;
  },

  async subscribePush(payload: PushSubscriptionDto): Promise<void> {
    await apiClient.post('/api/notifications/push-subscription', payload);
  },

  async unsubscribePush(): Promise<void> {
    await apiClient.delete('/api/notifications/push-subscription');
  },
};

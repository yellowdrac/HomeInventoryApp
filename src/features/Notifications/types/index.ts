export interface NotificationSettings {
  emailEnabled: boolean;
  emailAddress: string;
  alertWindowDays: number;
}

export interface PushSubscriptionDto {
  endpoint: string;
  p256dhKey: string;
  authKey: string;
}

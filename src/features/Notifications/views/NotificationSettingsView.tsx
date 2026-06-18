import { type FormEvent, useEffect, useState } from 'react';
import { Alert, Button, Input, Select } from '@/core/components/ui';
import { Switch } from '@/core/components/ui/Switch';
import { BellIcon } from '@/core/components/icons';
import { useAuth } from '@features/Auth/hooks/useAuth';
import { useNotificationSettings } from '../hooks/useNotificationSettings';
import { useUpdateNotificationSettings } from '../hooks/useUpdateNotificationSettings';
import { usePushSubscription } from '../hooks/usePushSubscription';

const ALERT_WINDOW_OPTIONS = [1, 2, 3, 5, 7, 10, 14];

const PUSH_LABELS: Record<string, string> = {
  checking: 'Checking...',
  'not-subscribed': 'Enable push notifications',
  subscribing: 'Enabling...',
  subscribed: 'Disable push notifications',
  denied: 'Permission denied by browser',
  unsupported: 'Not available on this browser',
};

export function NotificationSettingsView() {
  const { user } = useAuth();
  const { data: settings, isPending, isError } = useNotificationSettings();
  const update = useUpdateNotificationSettings();
  const push = usePushSubscription();

  const [emailEnabled, setEmailEnabled] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [alertWindowDays, setAlertWindowDays] = useState(3);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!settings) return;
    setEmailEnabled(settings.emailEnabled);
    setEmailAddress(settings.emailAddress || user?.email || '');
    setAlertWindowDays(settings.alertWindowDays);
  }, [settings, user?.email]);

  // Pre-fill email from auth user on first load
  useEffect(() => {
    if (!settings && user?.email && !emailAddress) {
      setEmailAddress(user.email);
    }
  }, [settings, user?.email, emailAddress]);

  function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaved(false);
    update.mutate(
      { emailEnabled, emailAddress: emailAddress.trim(), alertWindowDays },
      { onSuccess: () => setSaved(true) },
    );
  }

  if (isPending) {
    return (
      <section className="mx-auto max-w-lg" aria-busy="true">
        <p className="text-slate-600">Loading notification settings...</p>
      </section>
    );
  }

  const pushLabel = PUSH_LABELS[push.status] ?? 'Push notifications';
  const isPushLoading = push.status === 'checking' || push.status === 'subscribing';
  const isPushSubscribed = push.status === 'subscribed';
  const isPushBlocked =
    push.status === 'denied' || push.status === 'unsupported';
  const vapidMissing =
    push.isSupported && !import.meta.env.VITE_VAPID_PUBLIC_KEY;

  return (
    <section className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <BellIcon className="size-6 text-slate-700" aria-hidden="true" />
        <h1 className="text-2xl font-bold tracking-tight">
          Notification settings
        </h1>
      </div>

      {isError ? (
        <Alert tone="error">
          Failed to load notification settings. Please refresh and try again.
        </Alert>
      ) : null}

      <form onSubmit={handleSave} className="space-y-4">
        {/* Email */}
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="font-semibold text-slate-900">Email notifications</p>

          <label className="flex cursor-pointer items-center justify-between gap-4">
            <span className="text-sm text-slate-700">
              Send me an email when items are about to expire
            </span>
            <Switch
              checked={emailEnabled}
              onChange={setEmailEnabled}
              aria-label="Enable email notifications"
            />
          </label>

          {emailEnabled ? (
            <div className="space-y-1">
              <label
                htmlFor="notif-email"
                className="block text-sm font-medium text-slate-700"
              >
                Email address
              </label>
              <Input
                id="notif-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                required={emailEnabled}
              />
            </div>
          ) : null}
        </div>

        {/* Push */}
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-1">
            <p className="font-semibold text-slate-900">Push notifications</p>
            <p className="text-sm text-slate-500">
              Browser notifications sent directly to your device.
            </p>
          </div>

          {!push.isSupported ? (
            <Alert tone="info">
              Push notifications are not supported on this browser. On iOS,
              install the app to your home screen first.
            </Alert>
          ) : vapidMissing ? (
            <Alert tone="error">
              Push notifications are not configured on this server. Contact your
              administrator.
            </Alert>
          ) : (
            <>
              {push.status === 'denied' ? (
                <Alert tone="error">
                  Notification permission was denied. Reset it in your browser
                  settings and try again.
                </Alert>
              ) : null}

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={
                    isPushSubscribed ? push.unsubscribe : push.subscribe
                  }
                  disabled={isPushLoading || isPushBlocked}
                  className={
                    isPushSubscribed
                      ? 'rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50'
                      : 'rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50'
                  }
                >
                  {pushLabel}
                </button>

                {isPushSubscribed ? (
                  <span className="text-sm text-emerald-700">
                    ✓ Subscribed
                  </span>
                ) : null}
              </div>
            </>
          )}
        </div>

        {/* Alert window */}
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="font-semibold text-slate-900">Alert window</p>
          <div className="space-y-1">
            <label
              htmlFor="notif-window"
              className="block text-sm font-medium text-slate-700"
            >
              Notify me this many days before expiry
            </label>
            <Select
              id="notif-window"
              value={String(alertWindowDays)}
              onChange={(e) => setAlertWindowDays(Number(e.target.value))}
            >
              {ALERT_WINDOW_OPTIONS.map((days) => (
                <option key={days} value={days}>
                  {days} {days === 1 ? 'day' : 'days'}
                </option>
              ))}
            </Select>
          </div>
          <p className="text-xs text-slate-500">
            Items expiring within this window will trigger an alert.
          </p>
        </div>

        {update.isError ? (
          <Alert tone="error">
            Failed to save settings. Please try again.
          </Alert>
        ) : null}

        {saved && !update.isError ? (
          <Alert tone="success">Settings saved.</Alert>
        ) : null}

        <div className="flex justify-end">
          <Button type="submit" isLoading={update.isPending}>
            {update.isPending ? 'Saving...' : 'Save settings'}
          </Button>
        </div>
      </form>
    </section>
  );
}

import { useState, useEffect } from 'react';
import { env } from '@/core/config/env';
import { notificationsApi } from '../api/notificationsApi';

export type PushStatus =
  | 'checking'
  | 'unsupported'
  | 'not-subscribed'
  | 'subscribing'
  | 'subscribed'
  | 'denied';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const output = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    output[i] = rawData.charCodeAt(i);
  }
  return output;
}

const isSupported =
  typeof window !== 'undefined' &&
  'serviceWorker' in navigator &&
  'PushManager' in window &&
  'Notification' in window;

export function usePushSubscription() {
  const [status, setStatus] = useState<PushStatus>(
    isSupported ? 'checking' : 'unsupported',
  );

  useEffect(() => {
    if (!isSupported) return;
    let cancelled = false;
    navigator.serviceWorker
      .getRegistration('/sw.js')
      .then((reg) => {
        if (cancelled) return;
        if (!reg) {
          setStatus('not-subscribed');
          return;
        }
        return reg.pushManager.getSubscription().then((sub) => {
          if (cancelled) return;
          setStatus(sub ? 'subscribed' : 'not-subscribed');
        });
      })
      .catch(() => {
        if (!cancelled) setStatus('not-subscribed');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function subscribe() {
    if (!isSupported) return;
    const vapidKey = env.vapidPublicKey;
    if (!vapidKey) {
      console.warn('VITE_VAPID_PUBLIC_KEY is not configured');
      return;
    }

    setStatus('subscribing');
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setStatus('denied');
        return;
      }

      const reg = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });
      await navigator.serviceWorker.ready;

      const existing = await reg.pushManager.getSubscription();
      if (existing) await existing.unsubscribe();

      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      const json = subscription.toJSON();
      await notificationsApi.subscribePush({
        endpoint: subscription.endpoint,
        p256dhKey: json.keys?.p256dh ?? '',
        authKey: json.keys?.auth ?? '',
      });

      setStatus('subscribed');
    } catch {
      setStatus('not-subscribed');
    }
  }

  async function unsubscribe() {
    try {
      const reg = await navigator.serviceWorker.getRegistration('/sw.js');
      if (reg) {
        const sub = await reg.pushManager.getSubscription();
        if (sub) await sub.unsubscribe();
      }
      await notificationsApi.unsubscribePush();
    } finally {
      setStatus('not-subscribed');
    }
  }

  return { status, subscribe, unsubscribe, isSupported };
}

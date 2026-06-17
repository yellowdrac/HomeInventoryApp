self.addEventListener('push', (event) => {
  if (!event.data) return;
  const { title = 'HomeInventory', body = '', url = '/kitchen' } = event.data.json();
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/icon.svg',
      data: { url },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(event.notification.data?.url ?? '/kitchen');
            return client.focus();
          }
        }
        return clients.openWindow(event.notification.data?.url ?? '/kitchen');
      }),
  );
});

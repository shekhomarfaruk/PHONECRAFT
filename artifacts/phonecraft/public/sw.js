// PhoneCraft Service Worker — Push Notification Handler

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

// Handle incoming push messages
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let data = {};
  try { data = event.data.json(); } catch (_) {
    data = { title: 'PhoneCraft', body: event.data.text() };
  }

  // Admin-only notifications must not appear in the user app.
  // They are handled exclusively by the admin panel service worker.
  if (data.adminOnly === true) return;

  const title = data.title || 'PhoneCraft';
  const options = {
    body: data.body || '',
    icon: data.icon || '/logo.png',
    badge: '/logo.png',
    tag: data.tag || 'phonecraft',
    renotify: true,
    requireInteraction: false,
    data: { url: data.url || '/' },
    vibrate: [200, 100, 200],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle notification click — open the user app only
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';

  // Never navigate to admin panel from user app
  const safeUrl = url.includes('xpc-ctrl') ? '/' : url;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      // Focus existing tab if open
      for (const client of clients) {
        if ('focus' in client) {
          client.focus();
          if (client.navigate) client.navigate(safeUrl);
          return;
        }
      }
      // Otherwise open new tab
      if (self.clients.openWindow) return self.clients.openWindow(safeUrl);
    })
  );
});

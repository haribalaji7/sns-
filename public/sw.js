// CampusShield AI — Service Worker for PWA Offline Caching & Web Push Notifications

const CACHE_NAME = 'campusshield-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
];

// Install Event — Cache Core Assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate Event — Clean Old Caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event — Network First, Fallback to Cache
self.addEventListener('fetch', (event) => {
  // Only intercept GET requests
  if (event.request.method !== 'GET') return;

  // Don't intercept API or Next.js internals
  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/api') || url.pathname.startsWith('/_next/webpack-hmr')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone and store valid responses in cache
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Return cached page when offline
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // If HTML request fails, fallback to root cached index
          if (event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match('/');
          }
        });
      })
  );
});

// ─── Web Push Notifications Event Listener ────────────────────────────
self.addEventListener('push', (event) => {
  let data = {
    title: '🚨 CampusShield Emergency Alert',
    body: 'Active emergency event detected in your campus zone. Open CampusShield for safe routing.',
    icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🛡️</text></svg>',
    badge: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>⚡</text></svg>',
    url: '/student/dashboard',
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      data = { ...data, ...payload };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    vibrate: [200, 100, 200, 100, 400],
    data: { url: data.url || '/' },
    actions: [
      { action: 'open', title: 'Open CampusShield' },
      { action: 'close', title: 'Dismiss' },
    ],
    tag: 'campusshield-alert',
    renotify: true,
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// ─── Notification Click Routing Listener ──────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') return;

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

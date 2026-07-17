const CACHE_NAME = 'barbercria-cache-v4';
const ASSETS = [
  '/',
  '/index.html',
  '/main.js',
  '/betao.png',
  '/th.png',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Ignora chamadas para CDNs externas ou APIs se desejar (por exemplo, WhatsApp link, Unsplash, Lucide)
  // Mas para arquivos locais, serve do cache e atualiza em background
  const url = new URL(event.request.url);
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) {
          // Atualiza em background
          fetch(event.request).then(networkResponse => {
            if (networkResponse.status === 200) {
              caches.open(CACHE_NAME).then(cache => cache.put(event.request, networkResponse));
            }
          }).catch(() => {/* ignore background update failures */});
          return cachedResponse;
        }
        return fetch(event.request);
      })
    );
  } else {
    // Para CDNs externas, tenta cache primeiro, se falhar vai pra rede
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        return cachedResponse || fetch(event.request).then(response => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
          }
          return response;
        }).catch(() => caches.match('/index.html'));
      })
    );
  }
});

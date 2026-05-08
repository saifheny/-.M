const CACHE_NAME = 'ai-agent-pro-v4';
const ASSETS = [
  './',
  './index.html',
  './login.html',
  './privacy.html',
  './terms.html',
  './css/style.css',
  './css/mobile.css',
  './js/main.js',
  './js/ui.js',
  './js/editor.js',
  './manifest.json',
  './favicon.svg',
  './icon-512.png',
  './og-image.png'
];
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then(res => {
      const clone = res.clone();
      caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
      return res;
    }).catch(() => caches.match(e.request))
  );
});

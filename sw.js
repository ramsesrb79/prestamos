// Guarda la app en el dispositivo para que funcione sin internet.
const VERSION = 'finanzas-v2';
const ARCHIVOS = ['./', './index.html', './manifest.webmanifest', './icons/apple-touch-icon.png', './icons/icon-192.png', './icons/icon-512.png', './icons/favicon.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // La página: primero internet (para recibir mejoras), si no hay, la copia guardada
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then((r) => { const copia = r.clone(); caches.open(VERSION).then((c) => c.put('./index.html', copia)); return r; })
      .catch(() => caches.match('./index.html')));
    return;
  }
  // Íconos, fuentes y demás: la copia guardada, y si no existe se descarga y se guarda
  if (url.origin === location.origin || url.hostname.endsWith('gstatic.com') || url.hostname.endsWith('googleapis.com')) {
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((r) => {
      if (r.ok || r.type === 'opaque') { const copia = r.clone(); caches.open(VERSION).then((c) => c.put(req, copia)); }
      return r;
    })));
  }
});

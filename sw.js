// SmartCassa - service worker: l'app si avvia anche senza internet (dopo il primo caricamento online)
const CACHE = 'smartcassa-v12';
const CORE = ['./', './index.html', './smart_cassa_palmare.html', './manifest.json', './manifest_palmare.json',
  'https://unpkg.com/mqtt@5.10.1/dist/mqtt.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/localforage/1.10.0/localforage.min.js'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(CORE.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || !req.url.startsWith('http') || req.url.startsWith('ws')) return;
  e.respondWith(
    fetch(req).then(res => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return res; })
      .catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
  );
});

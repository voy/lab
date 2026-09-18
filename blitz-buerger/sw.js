const CACHE = 'blitz-buerger-v3';
const ASSETS = [
  './',
  './index.html',
  './app.js',
  './quiz-logic.js',
  './questions.js',
  './manifest.json',
  './images/wappen-brd.svg',
  './images/wappen-ddr.svg',
  './images/wappen-berlin.svg',
  './images/flagge-eu.svg',
  './images/berlin-karte.svg',
  './images/reichstag.jpg',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      caches.keys().then(keys =>
        Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
      ),
      self.clients.claim(),
    ])
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});

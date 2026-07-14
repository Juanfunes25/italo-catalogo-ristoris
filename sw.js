// Service worker — Catálogo Ristoris (Italo Gelateria)
// Cachea todo el app shell + el dataset + todas las fotos de producto
// para que la app funcione 100% offline después de la primera carga.

var CACHE_VERSION = 'ristoris-catalogo-v4';
var CORE_ASSETS = [
  './',
  './index.html',
  './css/styles.css',
  './js/app.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-192.png',
  './icons/icon-maskable-512.png',
  './data/productos.json',
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(function (cache) {
      return cache.addAll(CORE_ASSETS).then(function () {
        // Precache todas las fotos de producto listadas en productos.json
        return fetch('./data/productos.json').then(function (r) { return r.json(); }).then(function (productos) {
          var imgUrls = productos
            .filter(function (p) { return p.imagen; })
            .map(function (p) { return './' + p.imagen; });
          return Promise.all(
            imgUrls.map(function (url) {
              return cache.add(url).catch(function (err) {
                console.warn('No se pudo cachear', url, err);
              });
            })
          );
        });
      });
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE_VERSION; }).map(function (k) { return caches.delete(k); })
      );
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(function (cached) {
      var fetchPromise = fetch(event.request).then(function (networkResponse) {
        if (networkResponse && networkResponse.status === 200) {
          var copy = networkResponse.clone();
          caches.open(CACHE_VERSION).then(function (cache) { cache.put(event.request, copy); });
        }
        return networkResponse;
      }).catch(function () {
        return cached; // sin red: lo que haya en caché (o undefined)
      });

      // Cache-first para velocidad e independencia total de la red en tienda;
      // se actualiza en segundo plano si hay conexión.
      return cached || fetchPromise;
    })
  );
});

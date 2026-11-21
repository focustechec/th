/* Guarda la app para que abra al instante y sin señal muestre la pantalla.
   Las marcaciones siempre van al servidor (no se guardan aquí). Cambia VERSION en cada publicación. */
var VERSION = 'marcacion-v1';
var ARCHIVOS = ['./', 'index.html', 'manifest.webmanifest'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(ARCHIVOS); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  // La página: primero la red (para recibir cambios), si no hay señal la guardada
  if (r.mode === 'navigate') {
    e.respondWith(fetch(r).then(function (resp) { var c = resp.clone(); caches.open(VERSION).then(function (k) { k.put('./', c); }); return resp; })
      .catch(function () { return caches.match('./'); }));
    return;
  }
  e.respondWith(caches.match(r).then(function (hit) { return hit || fetch(r); }));
});

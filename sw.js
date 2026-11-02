const CACHE_NAME = 'bo1-zombies-cache-v1';
const TARGET_ORIGIN = 'https://vel.gg';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Interceptar solicitudes hacia el juego para aplicar estrategia Cache First con actualización en segundo plano
    if (url.origin === TARGET_ORIGIN || url.href.includes('vel.gg/bsz')) {
        event.respondWith(
            caches.open(CACHE_NAME).then(async (cache) => {
                const cachedResponse = await cache.match(event.request);
                
                const fetchPromise = fetch(event.request).then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        cache.put(event.request, networkResponse.clone());
                    }
                    return networkResponse;
                }).catch(() => {
                    // Si falla la red, continuamos usando el caché local sin errores
                });

                return cachedResponse || fetchPromise;
            })
        );
    }
});

const CACHE_NAME = 'bo1-zombies-cache-v2';
const TARGET_DOMAIN = 'vel.gg';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Interceptar cualquier recurso o subruta que pertenezca a vel.gg (mapas, wasm, bin, etc.)
    if (url.hostname.includes(TARGET_DOMAIN)) {
        event.respondWith(
            caches.open(CACHE_NAME).then(async (cache) => {
                const cachedResponse = await cache.match(event.request);
                
                const fetchPromise = fetch(event.request).then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        cache.put(event.request, networkResponse.clone());
                    }
                    return networkResponse;
                }).catch(() => {
                    // Si estás offline, continúa usando el caché local sin romper el juego
                });

                return cachedResponse || fetchPromise;
            })
        );
    }
});

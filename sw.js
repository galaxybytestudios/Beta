// sw.js - Service Worker para forzar SharedArrayBuffer
self.addEventListener("install", (e) => {
    self.skipWaiting();
});

self.addEventListener("activate", (e) => {
    e.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Si la respuesta es opaca o externa, se devuelve tal cual
                if (!response || response.status !== 200 || response.type === 'opaque') {
                    return response;
                }

                // Clonamos los headers para agregar las políticas de aislamiento
                const newHeaders = new Headers(response.headers);
                newHeaders.set("Cross-Origin-Opener-Policy", "same-origin");
                newHeaders.set("Cross-Origin-Embedder-Policy", "require-corp");

                return new Response(response.body, {
                    status: response.status,
                    statusText: response.statusText,
                    headers: newHeaders,
                });
            })
            .catch(() => {
                return fetch(event.request);
            })
    );
});

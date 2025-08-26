// sw.js
(() => {
    // If someone accidentally loads sw.js in a normal page, bail quietly.
    const isSW = typeof ServiceWorkerGlobalScope !== 'undefined' && self instanceof ServiceWorkerGlobalScope;
    if (!isSW) return;

    const CACHE = 'three-sides-v6';

    const scope = (self.registration && self.registration.scope) || (self.location.origin + '/');
    const P = (p) => new URL(p, scope).toString();

    const CORE = [
        'index.html',
        'style.css',
        'mainTheme.css',
        'manifest.webmanifest?v=7',
        'icon-192.png',
        'icon-512.png',
        'icon-192-maskable.png',
        'icon-512-maskable.png'
    ].map(P);

    self.addEventListener('install', (event) => {
        event.waitUntil((async () => {
            const cache = await caches.open(CACHE);
            await Promise.all(CORE.map(async (url) => {
                try {
                    const res = await fetch(url, { cache: 'no-cache' });
                    if (res.ok) await cache.put(url, res.clone());
                    else console.warn('[SW] skip (status)', res.status, url);
                } catch (e) {
                    console.warn('[SW] skip (fetch)', url, e);
                }
            }));
            self.skipWaiting();
        })());
    });

    self.addEventListener('activate', (event) => {
        event.waitUntil((async () => {
            const names = await caches.keys();
            await Promise.all(names.map((n) => (n === CACHE ? null : caches.delete(n))));
            await self.clients.claim();
        })());
    });

    // Network-first for navigations; SWR for others
    self.addEventListener('fetch', (event) => {
        const req = event.request;
        if (req.method !== 'GET') return;

        if (req.mode === 'navigate') {
            event.respondWith((async () => {
                const cache = await caches.open(CACHE);
                try {
                    const res = await fetch(req);
                    cache.put(req, res.clone());
                    return res;
                } catch {
                    return (await caches.match(req))
                        || (await caches.match(P('index.html')))
                        || Response.error();
                }
            })());
            return;
        }

        event.respondWith((async () => {
            const cached = await caches.match(req);
            if (cached) {
                fetch(req).then((res) => {
                    if (res && res.ok) caches.open(CACHE).then(c => c.put(req, res.clone()));
                }).catch(() => { });
                return cached;
            }
            try {
                const net = await fetch(req);
                if (net && net.ok) (await caches.open(CACHE)).put(req, net.clone());
                return net;
            } catch {
                return Response.error();
            }
        })());
    });
})();

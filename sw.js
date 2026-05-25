const CACHE_NAME = 'vocab-v4';

self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(c => c.addAll([
            new Request('./index.html', { cache: 'reload' }),
            new Request('./manifest.json', { cache: 'reload' }),
            new Request('./words.json', { cache: 'reload' }),
            new Request('./words.js', { cache: 'reload' })
        ]))
    );
    self.skipWaiting();
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', e => {
    // Skip non-GET requests
    if (e.request.method !== 'GET') return;

    e.respondWith(
        caches.match(e.request).then(r => {
            if (r) return r;
            return fetch(e.request).then(res => {
                if (res && res.ok && (res.type === 'basic' || res.type === 'cors')) {
                    const clone = res.clone();
                    caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
                }
                return res;
            }).catch(() => {
                if (e.request.mode === 'navigate') {
                    return caches.match(new Request('./index.html'));
                }
                return new Response('离线中', { status: 503 });
            });
        })
    );
});

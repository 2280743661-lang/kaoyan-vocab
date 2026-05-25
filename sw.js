const CACHE_NAME = 'vocab-v3';
const ASSETS = [
    'index.html',
    'manifest.json',
    'words.json'
];

self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(c => c.addAll(ASSETS))
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
    e.respondWith(
        caches.match(e.request).then(r => {
            if (r) return r;
            return fetch(e.request).then(res => {
                // Cache successful responses for future offline use
                if (res && res.ok && res.type === 'basic') {
                    const clone = res.clone();
                    caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
                }
                return res;
            }).catch(() => {
                // Offline fallback: try cache again for navigation requests
                if (e.request.mode === 'navigate') {
                    return caches.match('index.html');
                }
                return new Response('离线中', { status: 503 });
            });
        })
    );
});

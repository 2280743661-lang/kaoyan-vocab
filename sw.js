const CACHE_NAME = 'vocab-v6';

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

    // HTML/JS/JSON: 网络优先（确保更新及时生效）
    const url = new URL(e.request.url);
    const isDynamic = url.pathname.endsWith('.html') || url.pathname.endsWith('.js') || url.pathname.endsWith('.json') || url.pathname === '/' || url.pathname === '';

    if (isDynamic) {
        e.respondWith(
            fetch(e.request).then(res => {
                if (res && res.ok) {
                    const clone = res.clone();
                    caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
                }
                return res;
            }).catch(() => caches.match(e.request))
        );
    } else {
        // 其他资源：缓存优先
        e.respondWith(
            caches.match(e.request).then(r => {
                if (r) return r;
                return fetch(e.request).then(res => {
                    if (res && res.ok && (res.type === 'basic' || res.type === 'cors')) {
                        const clone = res.clone();
                        caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
                    }
                    return res;
                });
            })
        );
    }
});

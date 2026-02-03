// Basic Service Worker for Telugu Delicacies PWA
const CACHE_NAME = 'td-v1';
const ASSETS = [
    '/sales.html',
    '/styles.css',
    '/script.js',
    '/sales-page.css'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});

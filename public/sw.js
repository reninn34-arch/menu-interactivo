const CACHE_NAME = 'menu-interactivo-v4';
const API_CACHE_NAME = 'menu-api-v1';
const STATIC_CACHE_NAME = 'menu-static-v1';

const staticUrls = [
  '/',
  '/index.html',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE_NAME).then(cache => cache.addAll(staticUrls)),
      caches.open(CACHE_NAME),
    ]).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => 
        k !== CACHE_NAME && 
        k !== API_CACHE_NAME && 
        k !== STATIC_CACHE_NAME
      ).map(caches.delete)
    )).then(() => self.clients.claim()))
  );
});

const apiCacheStrategy = async (request) => {
  const cached = await caches.match(request);
  if (cached) return cached;
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(API_CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response(JSON.stringify({ error: 'Offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

const staticCacheStrategy = async (request) => {
  const cached = await caches.match(request);
  if (cached) return cached;
  
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
  }
  return response;
};

const networkFirstStrategy = async (request) => {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || new Response('Offline', { status: 503 });
  }
};

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const isGet = event.request.method === 'GET';
  
  if (!isGet) {
    event.respondWith(fetch(event.request));
    return;
  }

  if (url.pathname === '/manifest.json' || url.pathname.startsWith('/api/')) {
    event.respondWith(apiCacheStrategy(event.request));
    return;
  }

  if (url.pathname.endsWith('.js') || url.pathname.endsWith('.css') || url.pathname.endsWith('.woff2')) {
    event.respondWith(staticCacheStrategy(event.request));
    return;
  }

  event.respondWith(networkFirstStrategy(event.request));
});
/* Rosetide offline shell. Versioned CacheStorage only; never touches IndexedDB records. */
const CACHE_VERSION = 'rosetide-v2';
// Every route serves the same app HTML, so "/" is the offline shell for all pages.
const SHELL_URL = '/';
const PRECACHE = [SHELL_URL, '/manifest.json'];

function isCacheable(response) {
  return response.ok && !response.redirected && response.type === 'basic';
}

async function cacheIfValid(key, response) {
  if (!isCacheable(response)) return;
  const cache = await caches.open(CACHE_VERSION);
  await cache.put(key, response);
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all(
      PRECACHE.map(async (url) => {
        const response = await fetch(url, { cache: 'reload' });
        if (!isCacheable(response)) throw new Error(`Cannot precache ${url}: ${response.status}`);
        await cacheIfValid(url, response);
      }),
    ).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      // cache: 'reload' skips (and overwrites) any stale HTTP-cached response for this URL,
      // e.g. permanent redirects remembered from an earlier broken deploy.
      fetch(new Request(request, { cache: 'reload' }))
        .then((response) => {
          event.waitUntil(cacheIfValid(SHELL_URL, response.clone()));
          return response;
        })
        .catch(async () => (await caches.match(SHELL_URL)) ?? Response.error()),
    );
    return;
  }

  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ??
          fetch(request).then((response) => {
            event.waitUntil(cacheIfValid(request, response.clone()));
            return response;
          }),
      ),
    );
  }
});

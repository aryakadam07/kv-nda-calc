
const CACHE_NAME = "kv-nda-tax-calculator-v1";

const APP_FILES = [
  "./",
  "./index.html",
  "./manifest.json"
];

// Install and cache the basic app files
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(APP_FILES);
    })
  );
  self.skipWaiting();
});

// Activate and remove old app caches
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Cache only files from this GitHub Pages website.
// Never cache Google Apps Script or calculator responses.
self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);

  if (
    request.method !== "GET" ||
    url.origin !== self.location.origin
  ) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then(response => {
        if (response && response.ok) {
          const responseCopy = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseCopy);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(request);
      })
  );
});

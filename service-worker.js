const CACHE='cash-cacher-public-v5';
const ASSETS=['./','./index.html','./styles-v2.css?v=4','./app-public-v4.js?v=4','./offers.json','./config.js'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)))});
self.addEventListener('activate',e=>e.waitUntil(Promise.all([self.clients.claim(),caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))])));
self.addEventListener('fetch', e => {
  // Never cache POST requests such as Supabase tracking
  if (e.request.method !== 'GET') {
    e.respondWith(fetch(e.request));
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then(r => {
        const copy = r.clone();

        caches.open(CACHE).then(c => {
          c.put(e.request, copy);
        });

        return r;
      })
      .catch(() => caches.match(e.request))
  );
});

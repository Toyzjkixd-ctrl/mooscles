// ── SERVICE WORKER — Network First ───────────────────────────────────────────
const CACHE = 'mooscles-v1.2.3';

// Fichiers à pré-cacher au premier install
const PRECACHE = [
  '/mooscles/',
  '/mooscles/index.html',
  '/mooscles/js/main.js',
  '/mooscles/js/auth.js',
  '/mooscles/js/supabase.js',
  '/mooscles/js/exercises.js',
  '/mooscles/js/seance.js',
  '/mooscles/js/programmes.js',
  '/mooscles/js/history.js',
  '/mooscles/js/records.js',
  '/mooscles/js/nutrition.js',
  '/mooscles/js/theme.js',
];

// ── INSTALL : pré-cache les assets ───────────────────────────────────────────
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

// ── ACTIVATE : supprime les anciens caches ────────────────────────────────────
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// ── FETCH : Network First ─────────────────────────────────────────────────────
// Toujours essayer le réseau. Si ça marche → met à jour le cache + renvoie.
// Si réseau KO (offline) → fallback sur cache.
// Les requêtes vers Supabase (API) ne sont jamais cachées.
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Ne pas intercepter les appels API Supabase / Google Fonts / etc.
  if (!url.origin.includes(self.location.hostname)) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Mettre à jour le cache avec la nouvelle version
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

// ── SKIP WAITING sur demande de la page ──────────────────────────────────────
self.addEventListener('message', e => {
  if (e.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

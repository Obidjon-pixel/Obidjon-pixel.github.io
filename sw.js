/* Yangikent Market — ilova (PWA): internet sekin yoki yoʻq boʻlsa ham ochiladi. Versiya: beb86dd9b0 */
const CACHE = 'yk-beb86dd9b0';
const ASSETS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(() => { }).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('yk-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Sahifa: avval internetdan (yangi versiya), 4 soniyada javob boʻlmasa yoki internet yoʻq boʻlsa — saqlangan nusxa.
// Server (Supabase) soʻrovlari bu yerdan oʻtmaydi — ularni ilovaning oʻzi navbat bilan yuboradi
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin !== self.location.origin) return;
  if (r.mode === 'navigate') {
    const net = fetch(r).then(res => { if (res.ok) { const cp = res.clone(); caches.open(CACHE).then(c => c.put('./index.html', cp)); } return res; });
    const cached = () => caches.match('./index.html');
    e.respondWith(new Promise(resolve => {
      let done = false;
      const fin = v => { if (!done && v) { done = true; resolve(v); } };
      const t = setTimeout(() => cached().then(fin), 4000);
      net.then(res => { clearTimeout(t); fin(res); })
        .catch(() => { clearTimeout(t); cached().then(c => fin(c || new Response('Internet yoʻq', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }))); });
    }));
    return;
  }
  if (u.pathname.endsWith('/config.json') || u.pathname.endsWith('/version.json')) return;   // sozlama va versiya har doim yangi
  e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => {
    if (res.ok && res.type === 'basic') { const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)); }
    return res;
  })));
});

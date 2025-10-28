/*
  Service Worker to merge Unity data parts into a single response.
  Scope: '/'
*/

const CDN_BASE = 'https://cdn.jsdelivr.net/gh/yellowdevelopmnt/jsdelivr-cdns/asailorslifeforme/';
const PART_PATHS = [
  'SailorsLife.data.unityweb.part1',
  'SailorsLife.data.unityweb.part2',
  'SailorsLife.data.unityweb.part3'
];
const TARGET_FILENAME = 'SailorsLife.data.unityweb';

self.addEventListener('install', event => {
  // Activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  // Control open pages without reload
  event.waitUntil(self.clients.claim());
});

function postProgress(pct) {
  self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then(clients => {
    for (const client of clients) {
      client.postMessage({ type: 'merge-progress', percent: Math.max(0, Math.min(100, Math.floor(pct))) });
    }
  });
}

async function fetchAndMergeParts() {
  const parts = [];
  for (let i = 0; i < PART_PATHS.length; i++) {
    const url = CDN_BASE + PART_PATHS[i];
    const res = await fetch(url, { cache: 'no-cache', mode: 'cors' });
    if (!res.ok) throw new Error('Failed to fetch part: ' + url + ' (' + res.status + ')');
    const buf = await res.arrayBuffer();
    parts.push(new Uint8Array(buf));
    postProgress(((i + 1) / PART_PATHS.length) * 100);
  }
  let totalLen = parts.reduce((sum, a) => sum + a.length, 0);
  const merged = new Uint8Array(totalLen);
  let offset = 0;
  for (const a of parts) { merged.set(a, offset); offset += a.length; }
  return merged.buffer;
}

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  // Only intercept same-origin requests for the data file
  const isSameOrigin = url.origin === self.location.origin;
  const isTarget = url.pathname.endsWith('/' + TARGET_FILENAME) || url.pathname === '/' + TARGET_FILENAME || url.pathname.includes('/' + TARGET_FILENAME + '?');
  if (isSameOrigin && isTarget) {
    event.respondWith((async () => {
      try {
        const buffer = await fetchAndMergeParts();
        // Do not set Content-Encoding; the .unityweb is already compressed
        return new Response(buffer, {
          status: 200,
          headers: {
            'Content-Type': 'application/octet-stream',
            'Cache-Control': 'no-store'
          }
        });
      } catch (err) {
        // Fallback to network if merge fails
        try {
          return await fetch(event.request);
        } catch (e) {
          return new Response('Failed to load merged data: ' + (err && err.message || err), { status: 502 });
        }
      }
    })());
  }
});

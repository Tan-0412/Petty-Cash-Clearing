// ============================================================
//  Service Worker — Network First Strategy
//  HTML/JS/CSS โหลดจาก network เสมอ, cache เป็น fallback
// ============================================================

const CACHE_NAME = 'clear-loan-v3';

// ไฟล์ที่ cache ไว้สำหรับใช้ offline (static assets เท่านั้น)
const STATIC_ASSETS = [
  'icon-192.png',
  'icon-512.png',
  'manifest.json',
];

// ─── INSTALL ─────────────────────────────────────────────────
self.addEventListener('install', event => {
  // ข้าม waiting — activate ทันทีที่ติดตั้งเสร็จ
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS).catch(() => {
        // ถ้า icon ยังไม่มีก็ไม่เป็นไร
      });
    })
  );
});

// ─── ACTIVATE ────────────────────────────────────────────────
self.addEventListener('activate', event => {
  // ลบ cache เก่าทิ้งทั้งหมด
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ─── FETCH — Network First ────────────────────────────────────
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Google Fonts และ external API — ไม่แตะ
  if (!url.origin.includes(self.location.origin)) {
    return;
  }

  // HTML และ JS/CSS → Network First (ได้ของใหม่เสมอ)
  if (
    event.request.mode === 'navigate' ||
    url.pathname.endsWith('.html') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css')
  ) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  // รูปภาพ / manifest → Cache First (เปลี่ยนน้อย)
  event.respondWith(cacheFirst(event.request));
});

// Network First: ลอง network ก่อน, ถ้าไม่มีสัญญาณใช้ cache
async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request, { cache: 'no-store' });
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    return cached || new Response('Offline — กรุณาเชื่อมต่ออินเทอร์เน็ต', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
}

// Cache First: คืน cache ก่อน, ถ้าไม่มีค่อยไปดึง network
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
    return response;
  } catch {
    return new Response('', { status: 404 });
  }
}

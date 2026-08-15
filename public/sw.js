/**
 * アプリシェル用の軽い Service Worker。
 * 文書は network-first（オフライン時はキャッシュ）、`/_next/static` は cache-first。
 * NFC データは localStorage のままサーバーへ送らない。
 */
const CACHE_PREFIX = "web-nfc-shell-";
const CACHE = `${CACHE_PREFIX}v1`;

/** install 失敗を防ぐため必須と任意を分ける。`/app` はツール本体。 */
const REQUIRED_PRECACHE = ["/app"];
const OPTIONAL_PRECACHE = ["/"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then(async (cache) => {
        // 必須シェルは失敗したら install も失敗させる（オフライン時に確実に開くため）
        await cache.addAll(REQUIRED_PRECACHE);
        // 任意シェルは 1 件ずつ。瞬断・5xx で install 全体を落とさない
        await Promise.allSettled(OPTIONAL_PRECACHE.map((url) => cache.add(url)));
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            // この SW が管理する古い世代のみ削除。他用途の CacheStorage は残す
            .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request));
  }
});

/**
 * ネット優先。失敗時はキャッシュ、さらに `/app` へフォールバック。
 *
 * @param {Request} request
 * @returns {Promise<Response>}
 */
async function networkFirst(request) {
  const cache = await caches.open(CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    const appShell = await cache.match("/app");
    if (appShell) return appShell;
    return Response.error();
  }
}

/**
 * キャッシュ優先（ビルドハッシュ付き静的アセット向け）。
 *
 * @param {Request} request
 * @returns {Promise<Response>}
 */
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const cache = await caches.open(CACHE);
  const response = await fetch(request);
  if (response.ok) {
    cache.put(request, response.clone());
  }
  return response;
}

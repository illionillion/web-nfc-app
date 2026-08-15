/**
 * アプリシェル用の軽い Service Worker。
 * 文書は network-first（オフライン時はキャッシュ）、`/_next/static` は cache-first。
 * NFC データは localStorage のままサーバーへ送らない。
 */
const CACHE_PREFIX = "web-nfc-shell-";
const CACHE = `${CACHE_PREFIX}v1`;

/** オフラインで必ず開けるようにするツール本体。 */
const APP_SHELL = "/app";
/** 取得できなくても install を失敗させないシェル。 */
const OPTIONAL_SHELLS = ["/"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then(async (cache) => {
        await precacheShell(cache, APP_SHELL);
        await Promise.allSettled(OPTIONAL_SHELLS.map((url) => precacheShell(cache, url)));
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
    event.respondWith(networkFirst(event));
    return;
  }

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(event));
  }
});

/**
 * シェル HTML とそれが参照する `/_next/static` を揃えてキャッシュする。
 *
 * ハッシュ付きアセットを先に入れてから HTML を置くことで、SW 更新直後に
 * 「新しい HTML はあるが対応する JS/CSS が無い」状態を作らない。
 *
 * @param {Cache} cache
 * @param {string} url シェルのパス
 * @returns {Promise<void>}
 */
async function precacheShell(cache, url) {
  const response = await fetch(url, { cache: "reload" });
  if (!response.ok) {
    throw new Error(`precache failed: ${url} (${response.status})`);
  }

  const html = await response.clone().text();
  await Promise.allSettled(extractStaticAssets(html).map((asset) => cache.add(asset)));
  await cache.put(url, response);
}

/**
 * HTML から同一 origin の `/_next/static` 参照を集める。
 *
 * @param {string} html
 * @returns {string[]} 重複を除いたパス一覧
 */
function extractStaticAssets(html) {
  const matches = html.match(/\/_next\/static\/[^"'\\\s>)]+/g) ?? [];
  return [...new Set(matches)];
}

/**
 * ネット優先。失敗時はキャッシュ、さらに `/app` へフォールバック。
 *
 * @param {FetchEvent} event
 * @returns {Promise<Response>}
 */
async function networkFirst(event) {
  const request = event.request;
  const cache = await caches.open(CACHE);

  try {
    const response = await fetch(request);
    if (response.ok) {
      // レスポンス返却で SW が停止しても書き込みが中断しないよう待たせる
      event.waitUntil(cache.put(request, response.clone()));
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    const appShell = await cache.match(APP_SHELL);
    if (appShell) return appShell;
    return Response.error();
  }
}

/**
 * キャッシュ優先（ビルドハッシュ付き静的アセット向け）。
 *
 * @param {FetchEvent} event
 * @returns {Promise<Response>}
 */
async function cacheFirst(event) {
  const request = event.request;
  const cache = await caches.open(CACHE);

  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok) {
    event.waitUntil(cache.put(request, response.clone()));
  }
  return response;
}

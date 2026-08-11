/** 本番オリジン（Cloudflare Workers）。独自ドメインは当面使わない。 */
export const SITE_ORIGIN = "https://web-nfc-app.illionillion.workers.dev";

/**
 * Search Console 等で使う絶対 URL を組み立てる。
 *
 * @param path 先頭スラッシュ付きパス（例: `/app`）。省略時はオリジンのみ
 */
export function siteUrl(path = ""): string {
  if (!path) return SITE_ORIGIN;
  return new URL(path, SITE_ORIGIN).toString();
}

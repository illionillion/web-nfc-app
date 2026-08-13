/** 本番オリジン（Cloudflare Workers）。独自ドメインは当面使わない。 */
export const SITE_ORIGIN = "https://web-nfc-app.illionillion.workers.dev";

/** ソース・スター用の GitHub リポジトリ */
export const GITHUB_REPO_URL = "https://github.com/illionillion/web-nfc-app";

/** OGP / Twitter Card 用画像（`public/og.png`）。metadataBase と合わせて絶対 URL になる。 */
export const OG_IMAGE = {
  url: "/og.png",
  width: 1200,
  height: 630,
  alt: "Web NFC — ブラウザで NFC タグを読み書き",
} as const;

/**
 * Search Console 等で使う絶対 URL を組み立てる。
 *
 * @param path 先頭スラッシュ付きパス（例: `/app`）。省略時はオリジンのみ
 */
export function siteUrl(path = ""): string {
  if (!path) return SITE_ORIGIN;
  return new URL(path, SITE_ORIGIN).toString();
}

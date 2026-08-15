import type { MetadataRoute } from "next";

/**
 * Web App Manifest（Android Chrome のホーム画面追加向け）。
 * アイコンは既存ブランドマーク由来の PNG。
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Web NFC",
    short_name: "Web NFC",
    description: "ブラウザだけで NFC タグ（NDEF）を読み書きするツール",
    start_url: "/app",
    scope: "/",
    display: "standalone",
    background_color: "#f4f4f5",
    theme_color: "#ffffff",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}

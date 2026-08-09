import type { Metadata } from "next";

import { HomeLanding } from "@/components/home-landing";

export const metadata: Metadata = {
  title: {
    absolute: "Web NFC — ブラウザだけで NFC タグを読み書き",
  },
  description:
    "NDEF タグの読取・書込・消去を Android Chrome のブラウザだけで行うツール。データは端末内で完結します。",
};

/**
 * トップページ。SEO 向けの紹介と使い方・制約を示す。
 */
export default function Home() {
  return <HomeLanding />;
}

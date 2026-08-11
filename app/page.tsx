import type { Metadata } from "next";

import { HomeLanding } from "@/components/home-landing";

const homeTitle = "Web NFC — ブラウザだけで NFC タグを読み書き";
const homeDescription =
  "NDEF タグの読取・書込・消去を Android Chrome のブラウザだけで行うツール。データは端末内で完結します。";

export const metadata: Metadata = {
  title: {
    absolute: homeTitle,
  },
  description: homeDescription,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: homeTitle,
    description: homeDescription,
    url: "/",
  },
  twitter: {
    title: homeTitle,
    description: homeDescription,
  },
};

/**
 * トップページ。SEO 向けの紹介と使い方・制約を示す。
 */
export default function Home() {
  return <HomeLanding />;
}

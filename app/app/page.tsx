import type { Metadata } from "next";

import { NfcAppShell } from "@/features/app-shell/components/nfc-app-shell";

const appTitle = "読み書きツール";
const appDescription = "ブラウザだけで NFC タグ（NDEF）を読み書きするツール";

export const metadata: Metadata = {
  title: appTitle,
  description: appDescription,
  alternates: {
    canonical: "/app",
  },
  openGraph: {
    title: appTitle,
    description: appDescription,
    url: "/app",
  },
  twitter: {
    title: appTitle,
    description: appDescription,
  },
};

/**
 * Web NFC アプリ本体ページ。
 */
export default function AppPage() {
  return <NfcAppShell />;
}

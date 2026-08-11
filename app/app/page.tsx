import type { Metadata } from "next";

import { NfcAppShell } from "@/features/app-shell/components/nfc-app-shell";

export const metadata: Metadata = {
  title: "読み書きツール",
  description: "ブラウザだけで NFC タグ（NDEF）を読み書きするツール",
  alternates: {
    canonical: "/app",
  },
};

/**
 * Web NFC アプリ本体ページ。
 */
export default function AppPage() {
  return <NfcAppShell />;
}

"use client";

import { Toaster } from "sonner";

/**
 * アプリ全体で使うトースト表示。
 * ルート layout からマウントし、Client Component 経由で sonner を有効化する。
 */
export function AppToaster() {
  return (
    <Toaster
      theme="light"
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: "border border-zinc-200 shadow-sm",
        },
      }}
    />
  );
}

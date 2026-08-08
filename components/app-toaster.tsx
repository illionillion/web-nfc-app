"use client";

import { Toaster } from "sonner";

import { useResolvedTheme } from "@/lib/theme/use-resolved-theme";

/**
 * アプリ全体で使うトースト表示。
 * ルート layout からマウントし、Client Component 経由で sonner を有効化する。
 */
export function AppToaster() {
  const theme = useResolvedTheme();

  return (
    <Toaster
      theme={theme}
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: "border border-border shadow-sm",
        },
      }}
    />
  );
}

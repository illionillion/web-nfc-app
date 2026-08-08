"use client";

import { Toaster } from "sonner";

import { useResolvedTheme } from "@/lib/theme/use-resolved-theme";

type AppToasterProps = {
  /** RSC が html に付けた解決済みテーマ（system は light 扱い） */
  theme?: "light" | "dark";
};

/**
 * アプリ全体で使うトースト表示。
 * ルート layout からマウントし、Client Component 経由で sonner を有効化する。
 */
export function AppToaster({ theme: serverTheme = "light" }: AppToasterProps) {
  const theme = useResolvedTheme(serverTheme);

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

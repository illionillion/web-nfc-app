"use client";

import { useSyncExternalStore } from "react";

/**
 * html の dark class 変化を購読する。
 *
 * @param onStoreChange - class 変更時のコールバック
 * @returns unsubscribe
 */
function subscribeHtmlTheme(onStoreChange: () => void) {
  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

/**
 * 現在 html に付いている解決済みテーマを返す。
 *
 * @returns light または dark
 */
function getHtmlTheme(): "light" | "dark" {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

/**
 * Cookie 設定を解決したあとの実効テーマ（html の dark class）を返す。
 * SSR / hydrate 時は RSC から渡した snapshot を使い、html の class と食い違わないようにする。
 *
 * @param serverTheme - RSC が html に付けた light / dark（system は light 扱い）
 * @returns light または dark
 */
export function useResolvedTheme(serverTheme: "light" | "dark" = "light"): "light" | "dark" {
  return useSyncExternalStore(subscribeHtmlTheme, getHtmlTheme, () => serverTheme);
}

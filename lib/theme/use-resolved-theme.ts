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
 * SSR 時のフォールバック。
 *
 * @returns light
 */
function getServerHtmlTheme(): "light" {
  return "light";
}

/**
 * Cookie 設定を解決したあとの実効テーマ（html の dark class）を返す。
 *
 * @returns light または dark
 */
export function useResolvedTheme(): "light" | "dark" {
  return useSyncExternalStore(subscribeHtmlTheme, getHtmlTheme, getServerHtmlTheme);
}

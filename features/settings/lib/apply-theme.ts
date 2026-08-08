import type { ThemePreference } from "@/features/settings/types";

/**
 * `system` 選択時、初回描画前に OS の `prefers-color-scheme` を html へ反映する。
 * RSC は Cookie の light / dark しか確定できないため、system だけクライアントで補う。
 */
export const SYSTEM_THEME_INLINE_SCRIPT = `(function(){try{var t=document.documentElement.getAttribute("data-theme");if(t!=="system")return;var d=window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d);document.documentElement.style.colorScheme=d?"dark":"light";}catch(e){}})();`;

/**
 * テーマ設定から html に付ける dark class が必要かを返す。
 * `system` は RSC では判定できないので false。
 *
 * @param theme - Cookie のテーマ設定
 * @returns dark class を付けるなら true
 */
export function shouldUseDarkClass(theme: ThemePreference): boolean {
  return theme === "dark";
}

/**
 * テーマ設定を `document.documentElement` に即時反映する。
 *
 * @param theme - 適用するテーマ
 */
export function applyThemeToDocument(theme: ThemePreference): void {
  const root = document.documentElement;
  const isDark =
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  root.dataset.theme = theme;
  root.classList.toggle("dark", isDark);
  root.style.colorScheme = isDark ? "dark" : "light";
}

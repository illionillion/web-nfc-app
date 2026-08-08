import type { ThemePreference } from "@/features/settings/types";

/** テーマ設定 Cookie 名。NFC データは入れない。 */
export const THEME_COOKIE_NAME = "theme";

/** テーマ Cookie の寿命（秒）。1 年。 */
export const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/** 受け付けるテーマ値。 */
export const THEME_PREFERENCES = ["light", "dark", "system"] as const;

const THEME_PREFERENCE_SET = new Set<string>(THEME_PREFERENCES);

/**
 * 文字列がテーマ設定かどうかを判定する。
 *
 * @param value - 判定対象
 * @returns `ThemePreference` なら true
 */
export function isThemePreference(value: string): value is ThemePreference {
  return THEME_PREFERENCE_SET.has(value);
}

/**
 * Cookie 値をテーマ設定へ正規化する。
 * 未設定・不正値は現行のライト固定に合わせて `light` にする。
 *
 * @param value - Cookie の生値
 * @returns テーマ設定
 */
export function parseThemePreference(value: string | undefined | null): ThemePreference {
  if (value && isThemePreference(value)) {
    return value;
  }

  return "light";
}

/**
 * テーマ設定を Cookie に書き込む。
 * Client からの更新用。HttpOnly にはしない。HTTPS のときだけ Secure を付ける。
 *
 * @param theme - 保存するテーマ
 */
export function writeThemeCookie(theme: ThemePreference): void {
  const parts = [
    `${THEME_COOKIE_NAME}=${theme}`,
    "Path=/",
    `Max-Age=${THEME_COOKIE_MAX_AGE}`,
    "SameSite=Lax",
  ];

  if (window.location.protocol === "https:") {
    parts.push("Secure");
  }

  document.cookie = parts.join("; ");
}

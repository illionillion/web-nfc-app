import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  isThemePreference,
  parseThemePreference,
  THEME_COOKIE_MAX_AGE,
  THEME_COOKIE_NAME,
  writeThemeCookie,
} from "@/features/settings/lib/theme-cookie";

describe("isThemePreference", () => {
  it("light / dark / system を受け付ける", () => {
    expect(isThemePreference("light")).toBe(true);
    expect(isThemePreference("dark")).toBe(true);
    expect(isThemePreference("system")).toBe(true);
  });

  it("空文字・未知の値は拒否する", () => {
    expect(isThemePreference("")).toBe(false);
    expect(isThemePreference("auto")).toBe(false);
    expect(isThemePreference("LIGHT")).toBe(false);
  });
});

describe("parseThemePreference", () => {
  it("正当な値をそのまま返す", () => {
    expect(parseThemePreference("light")).toBe("light");
    expect(parseThemePreference("dark")).toBe("dark");
    expect(parseThemePreference("system")).toBe("system");
  });

  it("未設定・不正値は light にする", () => {
    expect(parseThemePreference(undefined)).toBe("light");
    expect(parseThemePreference(null)).toBe("light");
    expect(parseThemePreference("")).toBe("light");
    expect(parseThemePreference("auto")).toBe("light");
  });
});

describe("writeThemeCookie", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    document.cookie = `${THEME_COOKIE_NAME}=; Max-Age=0; Path=/`;
  });

  it("http では Secure なしで Cookie を書く", () => {
    writeThemeCookie("dark");

    expect(document.cookie).toContain(`${THEME_COOKIE_NAME}=dark`);
  });

  it("https では Secure 付きで Cookie を書く", () => {
    const cookieSetter = vi.fn();
    vi.stubGlobal("document", {
      get cookie() {
        return "";
      },
      set cookie(value: string) {
        cookieSetter(value);
      },
    });
    vi.stubGlobal("window", {
      location: { protocol: "https:" },
    });

    writeThemeCookie("system");

    expect(cookieSetter).toHaveBeenCalledWith(
      `${THEME_COOKIE_NAME}=system; Path=/; Max-Age=${THEME_COOKIE_MAX_AGE}; SameSite=Lax; Secure`
    );
  });
});

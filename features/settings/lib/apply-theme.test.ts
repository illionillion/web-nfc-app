import { beforeEach, describe, expect, it, vi } from "vitest";

import { applyThemeToDocument, shouldUseDarkClass } from "@/features/settings/lib/apply-theme";

describe("shouldUseDarkClass", () => {
  it("dark だけ true を返す", () => {
    expect(shouldUseDarkClass("dark")).toBe(true);
    expect(shouldUseDarkClass("light")).toBe(false);
    expect(shouldUseDarkClass("system")).toBe(false);
  });
});

describe("applyThemeToDocument", () => {
  beforeEach(() => {
    document.documentElement.className = "";
    delete document.documentElement.dataset.theme;
    document.documentElement.style.colorScheme = "";
    vi.unstubAllGlobals();
  });

  it("light では dark class を外す", () => {
    document.documentElement.classList.add("dark");
    applyThemeToDocument("light");

    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(document.documentElement.style.colorScheme).toBe("light");
  });

  it("dark では dark class を付ける", () => {
    applyThemeToDocument("dark");

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(document.documentElement.style.colorScheme).toBe("dark");
  });

  it("system は OS がダークなら dark class を付ける", () => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: query.includes("dark"),
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }));

    applyThemeToDocument("system");

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.dataset.theme).toBe("system");
    expect(document.documentElement.style.colorScheme).toBe("dark");
  });
});

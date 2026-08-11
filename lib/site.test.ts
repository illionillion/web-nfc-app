import { describe, expect, it } from "vitest";

import { OG_IMAGE, SITE_ORIGIN, siteUrl } from "@/lib/site";

describe("siteUrl", () => {
  it("オリジンだけのときは本番 URL を返す", () => {
    expect(siteUrl()).toBe(SITE_ORIGIN);
  });

  it("パスを絶対 URL にする", () => {
    expect(siteUrl("/app")).toBe(`${SITE_ORIGIN}/app`);
    expect(siteUrl("/terms")).toBe(`${SITE_ORIGIN}/terms`);
  });
});

describe("OG_IMAGE", () => {
  it("1200x630 の相対パスを持つ", () => {
    expect(OG_IMAGE.url).toBe("/og.png");
    expect(OG_IMAGE.width).toBe(1200);
    expect(OG_IMAGE.height).toBe(630);
  });
});

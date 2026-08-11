import { describe, expect, it } from "vitest";

import { SITE_ORIGIN, siteUrl } from "@/lib/site";

describe("siteUrl", () => {
  it("オリジンだけのときは本番 URL を返す", () => {
    expect(siteUrl()).toBe(SITE_ORIGIN);
  });

  it("パスを絶対 URL にする", () => {
    expect(siteUrl("/app")).toBe(`${SITE_ORIGIN}/app`);
    expect(siteUrl("/terms")).toBe(`${SITE_ORIGIN}/terms`);
  });
});

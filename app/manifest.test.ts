import { describe, expect, it } from "vitest";

import manifest from "@/app/manifest";

describe("manifest", () => {
  it("ホーム画面追加に必要なフィールドを持つ", () => {
    const data = manifest();

    expect(data.name).toBe("Web NFC");
    expect(data.short_name).toBe("Web NFC");
    expect(data.start_url).toBe("/app");
    expect(data.display).toBe("standalone");
    expect(data.theme_color).toBe("#ffffff");
    expect(data.background_color).toBe("#f4f4f5");
    expect(data.icons?.length).toBeGreaterThanOrEqual(2);
    expect(data.icons?.some((icon) => icon.sizes === "192x192")).toBe(true);
    expect(data.icons?.some((icon) => icon.sizes === "512x512")).toBe(true);
  });
});

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BrandMark } from "@/components/brand-mark";
import { BrandMarkHero, HERO_ARC_STYLE } from "@/components/brand-mark-hero";

describe("BrandMarkHero", () => {
  it("ヒーロー専用マークとして弧を2本持つ", () => {
    const { container } = render(<BrandMarkHero />);
    const root = container.querySelector("[data-brand-mark-hero]");

    expect(root).toBeInTheDocument();
    expect(root).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelectorAll(".bmh-arc")).toHaveLength(2);
    expect(container.querySelector(".bmh-arc1")).toBeInTheDocument();
    expect(container.querySelector(".bmh-arc2")).toBeInTheDocument();
  });

  it("BrandMark と同じ glyph / arc パスを使う", () => {
    const hero = render(<BrandMarkHero />);
    const mark = render(<BrandMark decorative />);

    const heroPaths = [...hero.container.querySelectorAll("[data-brand-mark-hero] path")].map(
      (path) => path.getAttribute("d")
    );
    const markPaths = [...mark.container.querySelectorAll("[data-brand-mark] path")].map((path) =>
      path.getAttribute("d")
    );

    expect(heroPaths).toEqual(markPaths);
  });

  it("prefers-reduced-motion ではアニメを止め弧を常時表示する", () => {
    expect(HERO_ARC_STYLE).toContain("@media (prefers-reduced-motion: reduce)");
    expect(HERO_ARC_STYLE).toMatch(
      /@media \(prefers-reduced-motion: reduce\)\s*\{\s*\.bmh-arc\s*\{\s*animation:\s*none;\s*opacity:\s*1;/
    );

    const { container } = render(<BrandMarkHero />);
    const style = container.querySelector("style");

    expect(style?.textContent).toBe(HERO_ARC_STYLE);
  });

  it("各弧に animation を割り当て内側→外側の開始順を持つ", () => {
    expect(HERO_ARC_STYLE).toMatch(
      /\.bmh-arc1\s*\{\s*animation:\s*bmh-arc1 2\.8s linear infinite;/
    );
    expect(HERO_ARC_STYLE).toMatch(
      /\.bmh-arc2\s*\{\s*animation:\s*bmh-arc2 2\.8s linear infinite;/
    );

    const arc1VisibleAt = Number(
      HERO_ARC_STYLE.match(/@keyframes bmh-arc1[\s\S]*?(\d+)%,\s*62%\s*\{\s*opacity:\s*1/)?.[1]
    );
    const arc2VisibleAt = Number(
      HERO_ARC_STYLE.match(/@keyframes bmh-arc2[\s\S]*?(\d+)%,\s*62%\s*\{\s*opacity:\s*1/)?.[1]
    );

    expect(arc1VisibleAt).toBeGreaterThan(0);
    expect(arc2VisibleAt).toBeGreaterThan(arc1VisibleAt);
  });
});

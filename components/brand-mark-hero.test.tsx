import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BrandMarkHero } from "@/components/brand-mark-hero";

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
    const { container } = render(<BrandMarkHero />);
    const paths = container.querySelectorAll("[data-brand-mark-hero] path");

    expect(paths[0]).toHaveAttribute("d", "M5 25.5V6.5h4.2l6.4 9.6V6.5H20v19h-4.2l-6.4-9.6v9.6H5z");
    expect(paths[1]).toHaveAttribute("d", "M22.2 10.8a7.2 7.2 0 0 1 0 10.4");
    expect(paths[2]).toHaveAttribute("d", "M25.4 7.8a11.6 11.6 0 0 1 0 16.4");
  });
});

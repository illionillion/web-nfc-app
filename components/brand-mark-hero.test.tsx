import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BrandMarkHero } from "@/components/brand-mark-hero";

describe("BrandMarkHero", () => {
  it("ヒーロー専用マークとして弧を3本持つ", () => {
    const { container } = render(<BrandMarkHero />);
    const root = container.querySelector("[data-brand-mark-hero]");

    expect(root).toBeInTheDocument();
    expect(root).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelectorAll(".bmh-arc")).toHaveLength(3);
    expect(container.querySelector(".bmh-arc1")).toBeInTheDocument();
    expect(container.querySelector(".bmh-arc2")).toBeInTheDocument();
    expect(container.querySelector(".bmh-arc3")).toBeInTheDocument();
  });

  it("N のパスは BrandMark と同じで、弧は3本を均等間隔にする", () => {
    const { container } = render(<BrandMarkHero />);
    const paths = container.querySelectorAll("[data-brand-mark-hero] path");

    expect(paths[0]).toHaveAttribute("d", "M5 25.5V6.5h4.2l6.4 9.6V6.5H20v19h-4.2l-6.4-9.6v9.6H5z");
    expect(paths[1]).toHaveAttribute("d", "M20.8 12.5a5 5 0 0 1 0 7");
    expect(paths[2]).toHaveAttribute("d", "M23.1 10a8.2 8.2 0 0 1 0 12");
    expect(paths[3]).toHaveAttribute("d", "M25.4 7.8a11.6 11.6 0 0 1 0 16.4");
  });
});

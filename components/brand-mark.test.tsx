import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BrandMark } from "@/components/brand-mark";

describe("BrandMark", () => {
  it("装飾でないときは名前付きの img になる", () => {
    render(<BrandMark />);

    expect(screen.getByRole("img", { name: "Web NFC" })).toBeInTheDocument();
  });

  it("favicon と同じ inset の枠を描く", () => {
    const { container } = render(<BrandMark decorative />);
    const rects = container.querySelectorAll("[data-brand-mark] rect");

    expect(rects).toHaveLength(2);
    expect(rects[1]).toHaveAttribute("x", "0.75");
    expect(rects[1]).toHaveAttribute("width", "30.5");
  });

  it("decorative のときはアクセシブルツリーから外す", () => {
    const { container } = render(<BrandMark decorative />);

    expect(screen.queryByRole("img", { name: "Web NFC" })).not.toBeInTheDocument();
    expect(container.querySelector("[data-brand-mark]")).toHaveAttribute("aria-hidden", "true");
  });
});

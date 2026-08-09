import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BrandMark } from "@/components/brand-mark";

describe("BrandMark", () => {
  it("装飾でないときは名前付きの img になる", () => {
    render(<BrandMark />);

    expect(screen.getByRole("img", { name: "Web NFC" })).toBeInTheDocument();
  });

  it("decorative のときはアクセシブルツリーから外す", () => {
    const { container } = render(<BrandMark decorative />);

    expect(screen.queryByRole("img", { name: "Web NFC" })).not.toBeInTheDocument();
    expect(container.querySelector("[data-brand-mark]")).toHaveAttribute("aria-hidden", "true");
  });
});

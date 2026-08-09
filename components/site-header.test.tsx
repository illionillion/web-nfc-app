import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SiteHeader } from "@/components/site-header";

describe("SiteHeader", () => {
  it("ホームへのリンクにマークと名前がある", () => {
    render(<SiteHeader theme="light" />);

    const home = screen.getByRole("link", { name: "Web NFC" });

    expect(home).toHaveAttribute("href", "/");
    expect(home.querySelector("[data-brand-mark]")).toBeInTheDocument();
  });
});

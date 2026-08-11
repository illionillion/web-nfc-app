import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SiteHeader } from "@/components/site-header";
import { GITHUB_REPO_URL } from "@/lib/site";

describe("SiteHeader", () => {
  it("ホームへのリンクにマークと名前がある", () => {
    render(<SiteHeader theme="light" />);

    const home = screen.getByRole("link", { name: "Web NFC" });

    expect(home).toHaveAttribute("href", "/");
    expect(home.querySelector("[data-brand-mark]")).toBeInTheDocument();
  });

  it("GitHub リポジトリへの外部リンクがある", () => {
    render(<SiteHeader theme="light" />);

    const github = screen.getByRole("link", { name: "GitHub リポジトリ（スター歓迎）" });

    expect(github).toHaveAttribute("href", GITHUB_REPO_URL);
    expect(github).toHaveAttribute("target", "_blank");
    expect(github).toHaveAttribute("rel", "noopener noreferrer");
  });
});

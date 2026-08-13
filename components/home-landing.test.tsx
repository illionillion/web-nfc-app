import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HomeLanding } from "@/components/home-landing";
import { GITHUB_REPO_URL } from "@/lib/site";

describe("HomeLanding", () => {
  it("favicon と同じマークを中央に出す", () => {
    const { container } = render(<HomeLanding />);

    expect(container.querySelector("[data-brand-mark]")).toBeInTheDocument();
  });

  it("ツールへの CTA を出す", () => {
    render(<HomeLanding />);

    expect(screen.getByRole("link", { name: "ツールを開く" })).toHaveAttribute("href", "/app");
  });

  it("GitHub で Star する導線がある", () => {
    render(<HomeLanding />);

    const star = screen.getByRole("link", { name: "GitHub で Star" });

    expect(star).toHaveAttribute("href", GITHUB_REPO_URL);
    expect(star).toHaveAttribute("target", "_blank");
    expect(star).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("使い方に読取・書込・消去の説明がある", () => {
    render(<HomeLanding />);

    const howTo = screen.getByRole("heading", { name: "使い方" }).closest("section");

    expect(howTo).not.toBeNull();
    expect(within(howTo!).getByText("1. 読む")).toBeInTheDocument();
    expect(within(howTo!).getByText("2. 書く")).toBeInTheDocument();
    expect(within(howTo!).getByText("3. 消す")).toBeInTheDocument();
    expect(within(howTo!).getByText(/「スキャン」/)).toBeInTheDocument();
    expect(within(howTo!).getByText(/「書き込む」/)).toBeInTheDocument();
    expect(within(howTo!).getByText(/「消去」/)).toBeInTheDocument();
  });

  it("制約に Android・HTTPS・端末内完結を書く", () => {
    render(<HomeLanding />);

    const limits = screen.getByRole("heading", { name: "制約" }).closest("section");

    expect(limits).not.toBeNull();
    expect(within(limits!).getByText(/Android Chrome/)).toBeInTheDocument();
    expect(within(limits!).getByText(/HTTPS/)).toBeInTheDocument();
    expect(within(limits!).getByText(/サーバーには送りません/)).toBeInTheDocument();
  });
});

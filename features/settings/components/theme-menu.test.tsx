import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ThemeMenu } from "@/features/settings/components/theme-menu";
import { THEME_COOKIE_NAME } from "@/features/settings/lib/theme-cookie";

describe("ThemeMenu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.cookie = `${THEME_COOKIE_NAME}=; Max-Age=0; Path=/`;
    document.documentElement.className = "";
    delete document.documentElement.dataset.theme;
  });

  it("現在のテーマをボタンラベルに出す", () => {
    render(<ThemeMenu theme="dark" />);

    expect(screen.getByRole("button", { name: "テーマ: ダーク" })).toBeInTheDocument();
  });

  it("メニューを開くと 3 つの選択肢が出る", async () => {
    const user = userEvent.setup();
    render(<ThemeMenu theme="light" />);

    await user.click(screen.getByRole("button", { name: "テーマ: ライト" }));

    expect(screen.getByRole("menu", { name: "テーマ" })).toBeInTheDocument();
    expect(screen.getByRole("menuitemradio", { name: "ライト" })).toHaveAttribute(
      "aria-checked",
      "true"
    );
    expect(screen.getByRole("menuitemradio", { name: "ダーク" })).toHaveAttribute(
      "aria-checked",
      "false"
    );
    expect(screen.getByRole("menuitemradio", { name: "システム" })).toHaveAttribute(
      "aria-checked",
      "false"
    );
  });

  it("ダークを選ぶと Cookie と html に反映する", async () => {
    const user = userEvent.setup();
    render(<ThemeMenu theme="light" />);

    await user.click(screen.getByRole("button", { name: "テーマ: ライト" }));
    await user.click(screen.getByRole("menuitemradio", { name: "ダーク" }));

    expect(document.cookie).toContain(`${THEME_COOKIE_NAME}=dark`);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "テーマ: ダーク" })).toBeInTheDocument();
  });

  it("Escape でメニューを閉じる", async () => {
    const user = userEvent.setup();
    render(<ThemeMenu theme="system" />);

    await user.click(screen.getByRole("button", { name: "テーマ: システム" }));
    expect(screen.getByRole("menu")).toBeInTheDocument();

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});

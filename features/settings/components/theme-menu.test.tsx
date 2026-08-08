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

  it("開くと radiogroup に 3 つの選択肢が出る", async () => {
    const user = userEvent.setup();
    render(<ThemeMenu theme="light" />);

    await user.click(screen.getByRole("button", { name: "テーマ: ライト" }));

    expect(screen.getByRole("radiogroup", { name: "テーマ" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "ライト" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("radio", { name: "ダーク" })).toHaveAttribute("aria-checked", "false");
    expect(screen.getByRole("radio", { name: "システム" })).toHaveAttribute(
      "aria-checked",
      "false"
    );
  });

  it("ダークを選ぶと Cookie と html に反映し、トリガーへフォーカスが戻る", async () => {
    const user = userEvent.setup();
    render(<ThemeMenu theme="light" />);

    await user.click(screen.getByRole("button", { name: "テーマ: ライト" }));
    await user.click(screen.getByRole("radio", { name: "ダーク" }));

    expect(document.cookie).toContain(`${THEME_COOKIE_NAME}=dark`);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "テーマ: ダーク" })).toHaveFocus();
  });

  it("Escape で閉じてトリガーへフォーカスが戻る", async () => {
    const user = userEvent.setup();
    render(<ThemeMenu theme="system" />);

    await user.click(screen.getByRole("button", { name: "テーマ: システム" }));
    expect(screen.getByRole("radiogroup")).toBeInTheDocument();

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "テーマ: システム" })).toHaveFocus();
  });
});

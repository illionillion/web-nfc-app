import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const pathnameState = { value: "/app" };

vi.mock("next/navigation", () => ({
  usePathname: () => pathnameState.value,
}));

import { ConfirmProvider, useConfirm } from "@/components/confirm-provider";

/**
 * confirm API を試すためのテスト用ボタン群。
 */
function ConfirmHarness() {
  const { confirm } = useConfirm();

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          void confirm("削除しますか？").then((confirmed) => {
            document.body.dataset.lastConfirm = confirmed ? "ok" : "cancel";
          });
        }}
      >
        開く
      </button>
    </div>
  );
}

/**
 * テスト内で pathname を変えて ConfirmProvider を再描画する。
 */
function PathnameProbe({ children }: { children: ReactNode }) {
  const [, setTick] = useState(0);

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          pathnameState.value = "/";
          setTick((tick) => tick + 1);
        }}
      >
        ルート変更
      </button>
      <ConfirmProvider>{children}</ConfirmProvider>
    </div>
  );
}

describe("ConfirmProvider", () => {
  beforeEach(() => {
    delete document.body.dataset.lastConfirm;
    pathnameState.value = "/app";
  });

  it("メッセージを表示する", async () => {
    const user = userEvent.setup();
    render(
      <ConfirmProvider>
        <ConfirmHarness />
      </ConfirmProvider>
    );

    await user.click(screen.getByRole("button", { name: "開く" }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("削除しますか？")).toBeInTheDocument();
  });

  it("OK で true を返す", async () => {
    const user = userEvent.setup();
    render(
      <ConfirmProvider>
        <ConfirmHarness />
      </ConfirmProvider>
    );

    await user.click(screen.getByRole("button", { name: "開く" }));
    await user.click(screen.getByRole("button", { name: "OK" }));

    await waitFor(() => {
      expect(document.body.dataset.lastConfirm).toBe("ok");
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("キャンセルで false を返す", async () => {
    const user = userEvent.setup();
    render(
      <ConfirmProvider>
        <ConfirmHarness />
      </ConfirmProvider>
    );

    await user.click(screen.getByRole("button", { name: "開く" }));
    await user.click(screen.getByRole("button", { name: "キャンセル" }));

    await waitFor(() => {
      expect(document.body.dataset.lastConfirm).toBe("cancel");
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("ESC（cancel イベント）でキャンセルする", async () => {
    const user = userEvent.setup();
    render(
      <ConfirmProvider>
        <ConfirmHarness />
      </ConfirmProvider>
    );

    await user.click(screen.getByRole("button", { name: "開く" }));
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();

    // jsdom では Escape が cancel を発火しないことがあるため、仕様どおり cancel を送る
    dialog.dispatchEvent(new Event("cancel", { bubbles: true, cancelable: true }));

    await waitFor(() => {
      expect(document.body.dataset.lastConfirm).toBe("cancel");
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("オーバーレイ（dialog 本体）クリックでキャンセルする", async () => {
    const user = userEvent.setup();
    render(
      <ConfirmProvider>
        <ConfirmHarness />
      </ConfirmProvider>
    );

    await user.click(screen.getByRole("button", { name: "開く" }));
    const dialog = screen.getByRole("dialog");

    // 内容クリックでは閉じない
    await user.click(screen.getByText("削除しますか？"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    // userEvent は子要素をヒットするため、dialog 自身を target にする fireEvent を使う
    // eslint-disable-next-line testing-library/prefer-user-event -- backdrop 相当の target を dialog 自身にする必要がある
    fireEvent.click(dialog);

    await waitFor(() => {
      expect(document.body.dataset.lastConfirm).toBe("cancel");
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("ルート変更で開いている確認をキャンセルする", async () => {
    const user = userEvent.setup();
    render(
      <PathnameProbe>
        <ConfirmHarness />
      </PathnameProbe>
    );

    await user.click(screen.getByRole("button", { name: "開く" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "ルート変更" }));

    await waitFor(() => {
      expect(document.body.dataset.lastConfirm).toBe("cancel");
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("開いたときにキャンセルボタンへフォーカスする", async () => {
    const user = userEvent.setup();
    render(
      <ConfirmProvider>
        <ConfirmHarness />
      </ConfirmProvider>
    );

    await user.click(screen.getByRole("button", { name: "開く" }));

    expect(screen.getByRole("button", { name: "キャンセル" })).toHaveFocus();
  });
});

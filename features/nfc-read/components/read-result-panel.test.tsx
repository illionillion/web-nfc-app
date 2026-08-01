import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ReadResultPanel } from "@/features/nfc-read/components/read-result-panel";
import type { NfcReadResult } from "@/features/nfc-read/types";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const sampleResult: NfcReadResult = {
  serialNumber: "AA:BB",
  readAt: "2026-07-25T12:00:00.000Z",
  records: [
    {
      kind: "text",
      recordType: "text",
      text: "hello-copy",
    },
  ],
};

const originalClipboardDescriptor = Object.getOwnPropertyDescriptor(navigator, "clipboard");

/**
 * navigator.clipboard を一時的に差し替える。
 *
 * @param clipboard - モック実装
 */
function stubClipboard(clipboard: { writeText: ReturnType<typeof vi.fn> }) {
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: clipboard,
  });
}

/**
 * navigator.clipboard をテスト前の状態へ戻す。
 */
function restoreClipboard() {
  if (originalClipboardDescriptor) {
    Object.defineProperty(navigator, "clipboard", originalClipboardDescriptor);
    return;
  }

  Reflect.deleteProperty(navigator, "clipboard");
}

describe("ReadResultPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    restoreClipboard();
  });

  it("スキャン中の案内を表示する", () => {
    render(<ReadResultPanel phase="scanning" result={null} errorMessage={null} />);
    expect(screen.getByText("スキャン中です。タグをかざしてください。")).toBeInTheDocument();
  });

  it("エラーメッセージを表示する", () => {
    render(<ReadResultPanel phase="error" result={null} errorMessage="失敗しました" />);
    expect(screen.getByRole("alert")).toHaveTextContent("失敗しました");
  });

  it("結果を表示し、全体コピーできる", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    stubClipboard({ writeText });

    render(<ReadResultPanel phase="success" result={sampleResult} errorMessage={null} />);

    expect(screen.getByText("AA:BB")).toBeInTheDocument();
    expect(screen.getByText("hello-copy")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "結果をコピー" }));

    expect(writeText).toHaveBeenCalledTimes(1);
    expect(writeText.mock.calls[0]?.[0]).toContain("hello-copy");
    expect(toast.success).toHaveBeenCalledWith("コピーしました");
    expect(screen.queryByText("コピーしました")).not.toBeInTheDocument();
  });

  it("全体コピー失敗時に失敗トーストを出す", async () => {
    const user = userEvent.setup();
    stubClipboard({
      writeText: vi.fn().mockRejectedValue(new Error("denied")),
    });

    render(<ReadResultPanel phase="success" result={sampleResult} errorMessage={null} />);

    await user.click(screen.getByRole("button", { name: "結果をコピー" }));

    expect(toast.error).toHaveBeenCalledWith("コピーに失敗しました");
    expect(screen.queryByText("コピーに失敗しました")).not.toBeInTheDocument();
  });

  it("レコード単位でもコピーできる", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    stubClipboard({ writeText });

    render(<ReadResultPanel phase="success" result={sampleResult} errorMessage={null} />);

    await user.click(screen.getByRole("button", { name: "レコード 1 をコピー" }));

    expect(writeText).toHaveBeenCalledWith("hello-copy");
    expect(toast.success).toHaveBeenCalledWith("コピーしました");
    expect(screen.queryByText("コピーしました")).not.toBeInTheDocument();
  });

  it("onReset 未指定ならクリアボタンを出さない", () => {
    render(<ReadResultPanel phase="success" result={sampleResult} errorMessage={null} />);

    expect(screen.queryByRole("button", { name: "結果をクリア" })).not.toBeInTheDocument();
  });

  it("結果をクリアで onReset する", async () => {
    const user = userEvent.setup();
    const onReset = vi.fn();

    render(
      <ReadResultPanel
        phase="success"
        result={sampleResult}
        errorMessage={null}
        onReset={onReset}
      />
    );

    await user.click(screen.getByRole("button", { name: "結果をクリア" }));

    expect(onReset).toHaveBeenCalledTimes(1);
  });
});

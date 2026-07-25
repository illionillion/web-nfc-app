import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ReadResultPanel } from "@/features/nfc-read/components/read-result-panel";
import type { NfcReadResult } from "@/features/nfc-read/types";

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

describe("ReadResultPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    render(<ReadResultPanel phase="success" result={sampleResult} errorMessage={null} />);

    expect(screen.getByText("AA:BB")).toBeInTheDocument();
    expect(screen.getByText("hello-copy")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "結果をコピー" }));

    expect(writeText).toHaveBeenCalledTimes(1);
    expect(writeText.mock.calls[0]?.[0]).toContain("hello-copy");
    expect(screen.getByText("コピーしました")).toBeInTheDocument();
  });

  it("全体コピー失敗時に失敗表示する", async () => {
    const user = userEvent.setup();
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: vi.fn().mockRejectedValue(new Error("denied")),
      },
    });

    render(<ReadResultPanel phase="success" result={sampleResult} errorMessage={null} />);

    await user.click(screen.getByRole("button", { name: "結果をコピー" }));

    expect(screen.getByText("コピーに失敗しました")).toBeInTheDocument();
  });

  it("レコード単位でもコピーできる", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    render(<ReadResultPanel phase="success" result={sampleResult} errorMessage={null} />);

    await user.click(screen.getByRole("button", { name: "レコード 1 をコピー" }));

    expect(writeText).toHaveBeenCalledWith("hello-copy");
    expect(screen.getByText("コピーしました")).toBeInTheDocument();
  });
});

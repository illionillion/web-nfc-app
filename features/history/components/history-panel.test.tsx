import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { HistoryPanel } from "@/features/history/components/history-panel";
import type { HistoryEntry } from "@/features/history/types";

const readEntry: HistoryEntry = {
  id: "e1",
  source: "read",
  createdAt: "2026-07-25T12:00:00.000Z",
  serialNumber: "AA:BB",
  records: [{ kind: "text", recordType: "text", text: "hello" }],
};

const unknownEntry: HistoryEntry = {
  id: "e2",
  source: "write",
  createdAt: "2026-07-25T13:00:00.000Z",
  serialNumber: "",
  records: [{ kind: "unknown", recordType: "mime", text: "bin" }],
};

/**
 * HistoryPanel の共通 props を作る。
 *
 * @param overrides - 上書き
 * @returns props
 */
function createProps(
  overrides: Partial<{
    entries: HistoryEntry[];
    onPreview: (entry: HistoryEntry) => void;
    onWriteThis: (entry: HistoryEntry) => void;
    onRemove: (entry: HistoryEntry) => void;
    onClear: () => void;
  }> = {}
) {
  return {
    entries: overrides.entries ?? [readEntry],
    onPreview: overrides.onPreview ?? vi.fn<(entry: HistoryEntry) => void>(),
    onWriteThis: overrides.onWriteThis ?? vi.fn<(entry: HistoryEntry) => void>(),
    onRemove: overrides.onRemove ?? vi.fn<(entry: HistoryEntry) => void>(),
    onClear: overrides.onClear ?? vi.fn<() => void>(),
  };
}

describe("HistoryPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("履歴が無いときは空の案内を出す", () => {
    render(<HistoryPanel {...createProps({ entries: [] })} />);

    expect(screen.getByText("履歴はまだありません")).toBeInTheDocument();
  });

  it("再表示で onPreview する", async () => {
    const user = userEvent.setup();
    const onPreview = vi.fn();

    render(<HistoryPanel {...createProps({ onPreview })} />);

    await user.click(screen.getByRole("button", { name: "再表示" }));

    expect(onPreview).toHaveBeenCalledWith(readEntry);
  });

  it("unknown だけの履歴は引き継げない", () => {
    render(<HistoryPanel {...createProps({ entries: [unknownEntry] })} />);

    expect(screen.getByRole("button", { name: "この内容で書く" })).toBeDisabled();
  });

  it("該当の履歴だけ削除できる", async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();

    render(<HistoryPanel {...createProps({ entries: [readEntry, unknownEntry], onRemove })} />);

    await user.click(screen.getByRole("button", { name: "履歴 2 を削除" }));

    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onRemove).toHaveBeenCalledWith(unknownEntry);
  });

  it("履歴を消すで onClear する", async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();

    render(<HistoryPanel {...createProps({ onClear })} />);

    await user.click(screen.getByRole("button", { name: "履歴を消す" }));

    expect(onClear).toHaveBeenCalledTimes(1);
  });
});

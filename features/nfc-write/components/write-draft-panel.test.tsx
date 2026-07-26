import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { WriteDraftPanel } from "@/features/nfc-write/components/write-draft-panel";
import type { WriteDraftRecord } from "@/features/nfc-write/types";

type DraftHandlers = {
  onAppend: (record: WriteDraftRecord) => void;
  onUpdate: (record: WriteDraftRecord) => void;
  onRemove: (id: string) => void;
};

/**
 * WriteDraftPanel の共通 props を作る。
 *
 * @param overrides - 上書き
 * @returns props
 */
function createProps(overrides: Partial<{ records: WriteDraftRecord[] } & DraftHandlers> = {}) {
  return {
    records: overrides.records ?? [],
    writePhase: "idle" as const,
    writeErrorMessage: null,
    onAppend: overrides.onAppend ?? vi.fn<(record: WriteDraftRecord) => void>(),
    onUpdate: overrides.onUpdate ?? vi.fn<(record: WriteDraftRecord) => void>(),
    onRemove: overrides.onRemove ?? vi.fn<(id: string) => void>(),
  };
}

describe("WriteDraftPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("追加ボタン押下直後は一覧に追加されない", async () => {
    const user = userEvent.setup();
    const onAppend = vi.fn();

    render(<WriteDraftPanel {...createProps({ onAppend })} />);

    await user.click(screen.getByRole("button", { name: "text を追加" }));

    expect(screen.getByRole("heading", { name: "レコードを編集" })).toBeInTheDocument();
    expect(onAppend).not.toHaveBeenCalled();
    expect(
      screen.getByText("下書きはまだありません。レコードを追加してください。")
    ).toBeInTheDocument();
  });

  it("キャンセルでは onAppend しない", async () => {
    const user = userEvent.setup();
    const onAppend = vi.fn();

    render(<WriteDraftPanel {...createProps({ onAppend })} />);

    await user.click(screen.getByRole("button", { name: "text を追加" }));
    await user.type(screen.getByLabelText("内容"), "draft");
    await user.click(screen.getByRole("button", { name: "キャンセル" }));

    expect(onAppend).not.toHaveBeenCalled();
    expect(screen.queryByRole("heading", { name: "レコードを編集" })).not.toBeInTheDocument();
  });

  it("保存後だけ onAppend する", async () => {
    const user = userEvent.setup();
    const onAppend = vi.fn();

    render(<WriteDraftPanel {...createProps({ onAppend })} />);

    await user.click(screen.getByRole("button", { name: "text を追加" }));
    await user.type(screen.getByLabelText("内容"), "saved-draft");
    await user.click(screen.getByRole("button", { name: "保存" }));

    expect(onAppend).toHaveBeenCalledTimes(1);
    expect(onAppend.mock.calls[0]?.[0]).toMatchObject({
      kind: "text",
      value: "saved-draft",
    });
  });

  it("不正な下書きのバリデーションを表示する", () => {
    render(
      <WriteDraftPanel
        {...createProps({
          records: [{ id: "bad", kind: "url", value: "not-a-url" }],
        })}
      />
    );

    expect(screen.getByRole("status")).toHaveTextContent(
      "書き込みできません: 有効な URL（https://... など）を入力してください。"
    );
    expect(
      screen.getByText("有効な URL（https://... など）を入力してください。")
    ).toBeInTheDocument();
  });
});

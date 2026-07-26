import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { RecordEditModal } from "@/features/nfc-write/components/record-edit-modal";
import type { WriteDraftRecord } from "@/features/nfc-write/types";

const seedRecord: WriteDraftRecord = {
  id: "draft-1",
  kind: "text",
  value: "",
};

describe("RecordEditModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("種別を切り替えても入力値をキャッシュする", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const onClose = vi.fn();

    render(<RecordEditModal record={seedRecord} onClose={onClose} onSave={onSave} />);

    await user.type(screen.getByLabelText("内容"), "hello-text");
    await user.selectOptions(screen.getByLabelText("種別"), "url");
    await user.type(screen.getByLabelText("内容"), "https://example.com");
    await user.selectOptions(screen.getByLabelText("種別"), "text");

    expect(screen.getByLabelText("内容")).toHaveValue("hello-text");
  });

  it("キャンセルでは onSave しない", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const onClose = vi.fn();

    render(<RecordEditModal record={seedRecord} onClose={onClose} onSave={onSave} />);

    await user.type(screen.getByLabelText("内容"), "will-cancel");
    await user.click(screen.getByRole("button", { name: "キャンセル" }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onSave).not.toHaveBeenCalled();
  });

  it("JSON 不正時は保存できない", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const onClose = vi.fn();

    render(
      <RecordEditModal
        record={{ id: "draft-json", kind: "json", value: "{\n  \n}" }}
        onClose={onClose}
        onSave={onSave}
      />
    );

    const editor = screen.getByLabelText("内容");
    await user.clear(editor);
    // userEvent は `{` を特殊キー開始と解釈するため `{{` でエスケープする
    await user.type(editor, '{{"broken":');

    expect(screen.getByRole("button", { name: "保存" })).toBeDisabled();
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it("正しい内容なら保存できる", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const onClose = vi.fn();

    render(<RecordEditModal record={seedRecord} onClose={onClose} onSave={onSave} />);

    await user.type(screen.getByLabelText("内容"), "saved-text");
    await user.click(screen.getByRole("button", { name: "保存" }));

    expect(onSave).toHaveBeenCalledWith({
      id: "draft-1",
      kind: "text",
      value: "saved-text",
    });
  });
});

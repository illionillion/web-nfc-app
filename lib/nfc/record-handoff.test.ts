import { describe, expect, it } from "vitest";

import type { HistoryRecord } from "@/features/history/types";
import type { ParsedNdefRecord } from "@/features/nfc-read/types";
import type { WriteDraftRecord } from "@/features/nfc-write/types";
import {
  historyRecordsToParsed,
  historyRecordsToWriteDraft,
  parsedRecordsToWriteDraft,
  writeDraftToHistoryRecords,
} from "@/lib/nfc/record-handoff";

describe("record-handoff", () => {
  it("unknown を除外して下書きへ変換する", () => {
    const records: ParsedNdefRecord[] = [
      { kind: "text", recordType: "text", text: "hello" },
      { kind: "unknown", recordType: "mime", text: "x" },
      { kind: "url", recordType: "url", text: "https://example.com" },
    ];

    const drafts = parsedRecordsToWriteDraft(records);
    expect(drafts).toHaveLength(2);
    expect(drafts[0]).toMatchObject({ kind: "text", value: "hello" });
    expect(drafts[1]).toMatchObject({ kind: "url", value: "https://example.com" });
    expect(drafts.every((draft) => typeof draft.id === "string")).toBe(true);
  });

  it("履歴レコードも同様に下書きへ変換する", () => {
    const records: HistoryRecord[] = [
      { kind: "json", recordType: "mime", mediaType: "application/json", text: '{"a":1}' },
      { kind: "unknown", recordType: "mime", text: "bin" },
    ];

    expect(historyRecordsToWriteDraft(records)).toEqual([
      expect.objectContaining({ kind: "json", value: '{"a":1}' }),
    ]);
  });

  it("下書きを履歴レコードへ変換する", () => {
    const drafts: WriteDraftRecord[] = [
      { id: "1", kind: "text", value: "hi" },
      { id: "2", kind: "json", value: "{}" },
    ];

    expect(writeDraftToHistoryRecords(drafts)).toEqual([
      { kind: "text", recordType: "text", text: "hi" },
      {
        kind: "json",
        recordType: "mime",
        mediaType: "application/json",
        text: "{}",
      },
    ]);
  });

  it("履歴を読取表示用へ戻せる", () => {
    const records: HistoryRecord[] = [
      { kind: "url", recordType: "url", text: "https://example.com" },
    ];
    expect(historyRecordsToParsed(records)).toEqual([
      { kind: "url", recordType: "url", text: "https://example.com" },
    ]);
  });
});

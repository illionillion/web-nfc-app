import type { HistoryRecord } from "@/features/history/types";
import type { ParsedNdefRecord } from "@/features/nfc-read/types";
import type { WriteDraftRecord, WriteRecordKind } from "@/features/nfc-write/types";

/**
 * 読取レコードを書込下書きへ変換する（unknown は除外）。
 *
 * @param records - 読取レコード
 * @returns 書込可能な下書き
 */
export function parsedRecordsToWriteDraft(records: ParsedNdefRecord[]): WriteDraftRecord[] {
  return historyRecordsToWriteDraft(records);
}

/**
 * 履歴レコードを書込下書きへ変換する（unknown は除外）。
 *
 * @param records - 履歴レコード
 * @returns 書込可能な下書き
 */
export function historyRecordsToWriteDraft(records: HistoryRecord[]): WriteDraftRecord[] {
  const drafts: WriteDraftRecord[] = [];
  for (const record of records) {
    if (record.kind === "unknown") {
      continue;
    }
    drafts.push({
      id: createId(),
      kind: record.kind as WriteRecordKind,
      value: record.text,
    });
  }
  return drafts;
}

/**
 * 書込下書きを履歴表示用レコードへ変換する。
 *
 * @param records - 下書き
 * @returns 履歴レコード
 */
export function writeDraftToHistoryRecords(records: WriteDraftRecord[]): HistoryRecord[] {
  return records.map((record) => {
    if (record.kind === "json") {
      return {
        kind: "json",
        recordType: "mime",
        mediaType: "application/json",
        text: record.value,
      };
    }
    return {
      kind: record.kind,
      recordType: record.kind,
      text: record.value,
    };
  });
}

/**
 * 履歴レコードを読取結果表示用へ変換する。
 *
 * @param records - 履歴レコード
 * @returns 読取表示用レコード
 */
export function historyRecordsToParsed(records: HistoryRecord[]): ParsedNdefRecord[] {
  return records.map((record) => ({
    kind: record.kind,
    recordType: record.recordType,
    mediaType: record.mediaType,
    text: record.text,
  }));
}

/**
 * 下書き用 ID を生成する。
 *
 * @returns ID
 */
function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `draft-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

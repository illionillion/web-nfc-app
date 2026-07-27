import type { WriteDraftRecord } from "@/features/nfc-write/types";

export const WRITE_DRAFT_STORAGE_KEY = "web-nfc-app.write-draft.v1";

/**
 * 書込下書きを localStorage から読み込む。
 *
 * @returns 下書きレコード。壊れている場合は空配列
 */
export function loadWriteDraftRecords(): WriteDraftRecord[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(WRITE_DRAFT_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(isWriteDraftRecord);
  } catch {
    return [];
  }
}

/**
 * 書込下書きを localStorage へ保存する。
 *
 * @param records - 下書きレコード
 */
export function saveWriteDraftRecords(records: WriteDraftRecord[]): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(WRITE_DRAFT_STORAGE_KEY, JSON.stringify(records));
}

/**
 * 未知オブジェクトが WriteDraftRecord か判定する。
 *
 * @param value - 判定対象
 * @returns WriteDraftRecord なら true
 */
function isWriteDraftRecord(value: unknown): value is WriteDraftRecord {
  if (!value || typeof value !== "object") {
    return false;
  }
  const record = value as Partial<WriteDraftRecord>;
  return (
    typeof record.id === "string" &&
    (record.kind === "text" || record.kind === "url" || record.kind === "json") &&
    typeof record.value === "string"
  );
}

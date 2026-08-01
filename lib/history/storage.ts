import type { HistoryEntry, HistoryRecord } from "@/features/history/types";

export const HISTORY_STORAGE_KEY = "web-nfc-app.history.v1";
export const HISTORY_MAX_ITEMS = 100;

/**
 * localStorage から履歴を読み込む。
 *
 * @returns 履歴一覧（新しい順）。壊れている場合は空配列
 */
export function loadHistoryEntries(): HistoryEntry[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(isHistoryEntry).slice(0, HISTORY_MAX_ITEMS);
  } catch {
    return [];
  }
}

/**
 * 履歴を localStorage へ保存する（最大件数で切り詰め）。
 * 容量超過やストレージ無効時は保存を諦める。呼び出し元は読取成功時の
 * effect も含むため、例外を投げるとアプリごと落ちてしまう。
 *
 * @param entries - 履歴一覧（新しい順想定）
 */
export function saveHistoryEntries(entries: HistoryEntry[]): void {
  if (typeof window === "undefined") {
    return;
  }

  const next = entries.slice(0, HISTORY_MAX_ITEMS);
  try {
    window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(next));
  } catch {
    return;
  }
}

/**
 * 先頭に 1 件追加し、最大件数を超えた古い件を落とす。
 *
 * @param entries - 既存履歴
 * @param entry - 追加する件
 * @returns 更新後の履歴
 */
export function prependHistoryEntry(entries: HistoryEntry[], entry: HistoryEntry): HistoryEntry[] {
  return [entry, ...entries].slice(0, HISTORY_MAX_ITEMS);
}

/**
 * 未知オブジェクトが HistoryEntry か判定する。
 *
 * @param value - 判定対象
 * @returns HistoryEntry なら true
 */
function isHistoryEntry(value: unknown): value is HistoryEntry {
  if (!value || typeof value !== "object") {
    return false;
  }
  const entry = value as Partial<HistoryEntry>;
  return (
    typeof entry.id === "string" &&
    (entry.source === "read" || entry.source === "write") &&
    typeof entry.createdAt === "string" &&
    typeof entry.serialNumber === "string" &&
    Array.isArray(entry.records) &&
    entry.records.every(isHistoryRecord)
  );
}

/**
 * 未知オブジェクトが HistoryRecord か判定する。
 * 表示側は text などが揃っている前提なので、読込時点で弾く。
 *
 * @param value - 判定対象
 * @returns HistoryRecord なら true
 */
function isHistoryRecord(value: unknown): value is HistoryRecord {
  if (!value || typeof value !== "object") {
    return false;
  }
  const record = value as Partial<HistoryRecord>;
  return (
    (record.kind === "text" ||
      record.kind === "url" ||
      record.kind === "json" ||
      record.kind === "unknown") &&
    typeof record.recordType === "string" &&
    typeof record.text === "string" &&
    (record.mediaType === undefined || typeof record.mediaType === "string")
  );
}

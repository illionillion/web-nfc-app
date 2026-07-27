import type { HistoryEntry } from "@/features/history/types";

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
 *
 * @param entries - 履歴一覧（新しい順想定）
 */
export function saveHistoryEntries(entries: HistoryEntry[]): void {
  if (typeof window === "undefined") {
    return;
  }

  const next = entries.slice(0, HISTORY_MAX_ITEMS);
  window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(next));
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
    Array.isArray(entry.records)
  );
}

/**
 * 履歴に保存するレコード（読取表示モデルと同型）。
 */
export type HistoryRecord = {
  kind: "text" | "url" | "json" | "unknown";
  recordType: string;
  mediaType?: string;
  text: string;
};

/**
 * 履歴エントリの発生源。
 */
export type HistorySource = "read" | "write";

/**
 * localStorage に残す 1 件の履歴。
 */
export type HistoryEntry = {
  id: string;
  source: HistorySource;
  createdAt: string;
  serialNumber: string;
  records: HistoryRecord[];
};

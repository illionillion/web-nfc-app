/**
 * 書込下書きで扱えるレコード種別。
 */
export type WriteRecordKind = "text" | "url" | "json";

/**
 * 書込下書きの 1 レコード。
 */
export type WriteDraftRecord = {
  id: string;
  kind: WriteRecordKind;
  value: string;
};

/**
 * 書込処理のフェーズ。
 */
export type NfcWritePhase = "idle" | "writing" | "success" | "error" | "cancelled";

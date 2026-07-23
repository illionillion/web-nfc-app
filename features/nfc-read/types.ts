/**
 * アプリ内で扱う NDEF レコード種別。
 */
export type NdefRecordKind = "text" | "url" | "json" | "unknown";

/**
 * 表示・コピー用に正規化した NDEF レコード。
 */
export type ParsedNdefRecord = {
  kind: NdefRecordKind;
  /** ブラウザが返す recordType */
  recordType: string;
  mediaType?: string;
  /** 表示用テキスト */
  text: string;
};

/**
 * 1回の読取結果。
 */
export type NfcReadResult = {
  serialNumber: string;
  records: ParsedNdefRecord[];
  readAt: string;
};

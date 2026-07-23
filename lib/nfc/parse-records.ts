import type { NdefRecordKind, ParsedNdefRecord } from "@/features/nfc-read/types";

/**
 * DataView を文字列へデコードする。
 *
 * @param data - レコードの data
 * @param encoding - TextDecoder に渡す encoding（未指定時は utf-8）
 * @returns デコード結果。data が無い場合は空文字
 */
function decodeRecordData(data: DataView | undefined, encoding?: string): string {
  if (!data) {
    return "";
  }

  try {
    return new TextDecoder(encoding || "utf-8").decode(data);
  } catch {
    return new TextDecoder("utf-8").decode(data);
  }
}

/**
 * ブラウザの NDEFRecord をアプリ用の表示モデルへ変換する。
 *
 * @param record - Web NFC のレコード
 * @returns 正規化済みレコード
 */
export function parseNdefRecord(record: NDEFRecord): ParsedNdefRecord {
  const recordType = record.recordType;
  const mediaType = record.mediaType;

  if (recordType === "text") {
    return {
      kind: "text",
      recordType,
      mediaType,
      text: decodeRecordData(record.data, record.encoding),
    };
  }

  if (recordType === "url") {
    return {
      kind: "url",
      recordType,
      mediaType,
      text: decodeRecordData(record.data),
    };
  }

  if (recordType === "mime" && mediaType === "application/json") {
    const raw = decodeRecordData(record.data);
    return {
      kind: "json",
      recordType,
      mediaType,
      text: formatJsonText(raw),
    };
  }

  return {
    kind: "unknown",
    recordType,
    mediaType,
    text: decodeRecordData(record.data) || "(変換できないレコード)",
  };
}

/**
 * NDEFMessage のレコード一覧を変換する。
 *
 * @param records - NDEF レコード配列
 * @returns 正規化済みレコード配列
 */
export function parseNdefRecords(records: ReadonlyArray<NDEFRecord>): ParsedNdefRecord[] {
  return records.map(parseNdefRecord);
}

/**
 * レコード種別の表示ラベル。
 *
 * @param kind - 種別
 * @returns ラベル
 */
export function getRecordKindLabel(kind: NdefRecordKind): string {
  switch (kind) {
    case "text":
      return "text";
    case "url":
      return "url";
    case "json":
      return "json";
    case "unknown":
      return "unknown";
  }
}

/**
 * JSON 文字列を可能な範囲で整形する。
 *
 * @param raw - 生文字列
 * @returns 整形後、または元の文字列
 */
function formatJsonText(raw: string): string {
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
}

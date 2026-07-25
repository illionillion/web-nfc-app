import type { WriteDraftRecord, WriteRecordKind } from "@/features/nfc-write/types";

export type DraftValidationIssue = {
  recordId: string;
  kind: WriteRecordKind;
  message: string;
};

/**
 * 単一レコードの入力を検証する。
 *
 * @param record - 下書きレコード
 * @returns 問題がなければ null
 */
export function validateWriteDraftRecord(record: WriteDraftRecord): DraftValidationIssue | null {
  const value = record.value.trim();

  if (!value) {
    return {
      recordId: record.id,
      kind: record.kind,
      message: "内容が空です。",
    };
  }

  if (record.kind === "url" && !isAbsoluteUrl(value)) {
    return {
      recordId: record.id,
      kind: record.kind,
      message: "有効な URL（https://... など）を入力してください。",
    };
  }

  if (record.kind === "json") {
    try {
      JSON.parse(value);
    } catch {
      return {
        recordId: record.id,
        kind: record.kind,
        message: "JSON として解釈できません。",
      };
    }
  }

  return null;
}

/**
 * 下書き全体を検証する。
 *
 * @param records - 下書きレコード一覧
 * @returns 先頭の問題。問題なしなら null
 */
export function validateWriteDraft(records: WriteDraftRecord[]): DraftValidationIssue | null {
  if (records.length === 0) {
    return {
      recordId: "",
      kind: "text",
      message: "書き込むレコードを追加してください。",
    };
  }

  for (const record of records) {
    const issue = validateWriteDraftRecord(record);
    if (issue) {
      return issue;
    }
  }

  return null;
}

/**
 * 下書きを NDEFMessageInit へ変換する。
 * 呼び出し前に validateWriteDraft で検証済みであること。
 *
 * @param records - 下書きレコード一覧
 * @returns Web NFC へ渡すメッセージ
 */
export function buildNdefMessageInit(records: WriteDraftRecord[]): NDEFMessageInit {
  return {
    records: records.map(toNdefRecordInit),
  };
}

/**
 * 下書き 1 件を NDEFRecordInit へ変換する。
 *
 * @param record - 下書きレコード
 * @returns Web NFC レコード初期化オブジェクト
 */
function toNdefRecordInit(record: WriteDraftRecord): NDEFRecordInit {
  const value = record.value.trim();

  switch (record.kind) {
    case "text":
      return {
        recordType: "text",
        data: value,
      };
    case "url":
      return {
        recordType: "url",
        data: value,
      };
    case "json":
      // mime レコードの data は文字列不可。BufferSource が必須（Chrome Web NFC）
      return {
        recordType: "mime",
        mediaType: "application/json",
        data: new TextEncoder().encode(JSON.stringify(JSON.parse(value))),
      };
  }
}

/**
 * 種別の表示ラベル。
 *
 * @param kind - 種別
 * @returns ラベル
 */
export function getWriteRecordKindLabel(kind: WriteRecordKind): string {
  switch (kind) {
    case "text":
      return "text";
    case "url":
      return "url";
    case "json":
      return "json";
  }
}

/**
 * 絶対 URL かどうかを判定する。
 *
 * @param value - 入力文字列
 * @returns 絶対 URL なら true
 */
function isAbsoluteUrl(value: string): boolean {
  try {
    return Boolean(new URL(value));
  } catch {
    return false;
  }
}

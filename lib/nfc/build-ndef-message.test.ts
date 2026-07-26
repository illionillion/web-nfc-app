import { describe, expect, it } from "vitest";

import type { WriteDraftRecord } from "@/features/nfc-write/types";
import {
  buildNdefMessageInit,
  getWriteRecordKindLabel,
  validateWriteDraft,
  validateWriteDraftRecord,
} from "@/lib/nfc/build-ndef-message";

/**
 * テスト用の下書きレコードを作る。
 *
 * @param overrides - 上書き値
 * @returns 下書きレコード
 */
function createRecord(
  overrides: Partial<WriteDraftRecord> & Pick<WriteDraftRecord, "kind">
): WriteDraftRecord {
  return {
    id: overrides.id ?? "record-1",
    kind: overrides.kind,
    value: overrides.value ?? "",
  };
}

describe("validateWriteDraftRecord", () => {
  it("空の内容はエラーになる", () => {
    expect(validateWriteDraftRecord(createRecord({ kind: "text", value: "  " }))).toEqual({
      recordId: "record-1",
      kind: "text",
      message: "内容が空です。",
    });
  });

  it("http / https 以外の URL はエラーになる", () => {
    expect(
      validateWriteDraftRecord(createRecord({ kind: "url", value: "javascript:alert(1)" }))
    ).toMatchObject({
      message: "有効な URL（https://... など）を入力してください。",
    });
    expect(
      validateWriteDraftRecord(createRecord({ kind: "url", value: "ftp://example.com" }))
    ).toMatchObject({
      message: "有効な URL（https://... など）を入力してください。",
    });
  });

  it("http / https の URL は通る", () => {
    expect(
      validateWriteDraftRecord(createRecord({ kind: "url", value: "https://example.com" }))
    ).toBeNull();
    expect(
      validateWriteDraftRecord(createRecord({ kind: "url", value: "http://example.com" }))
    ).toBeNull();
  });

  it("不正な JSON は validateJsonText のメッセージを返す", () => {
    expect(validateWriteDraftRecord(createRecord({ kind: "json", value: '{"a":' }))).toMatchObject({
      kind: "json",
      message: "オブジェクトの閉じ括弧 } が不足しています。",
    });
  });

  it("正しい text / json は通る", () => {
    expect(validateWriteDraftRecord(createRecord({ kind: "text", value: "hello" }))).toBeNull();
    expect(
      validateWriteDraftRecord(createRecord({ kind: "json", value: '{"ok": true}' }))
    ).toBeNull();
  });
});

describe("validateWriteDraft", () => {
  it("レコードが空なら追加を促す", () => {
    expect(validateWriteDraft([])).toEqual({
      recordId: "",
      kind: "text",
      message: "書き込むレコードを追加してください。",
    });
  });

  it("先頭の問題レコードだけ返す", () => {
    const issue = validateWriteDraft([
      createRecord({ id: "ok", kind: "text", value: "hello" }),
      createRecord({ id: "bad", kind: "url", value: "not-a-url" }),
    ]);

    expect(issue).toMatchObject({
      recordId: "bad",
      kind: "url",
    });
  });

  it("すべて正しければ null を返す", () => {
    expect(
      validateWriteDraft([
        createRecord({ id: "t", kind: "text", value: "hello" }),
        createRecord({ id: "u", kind: "url", value: "https://example.com" }),
      ])
    ).toBeNull();
  });
});

describe("buildNdefMessageInit", () => {
  it("text / url を NDEFRecordInit に変換する", () => {
    const message = buildNdefMessageInit([
      createRecord({ id: "t", kind: "text", value: "  hello  " }),
      createRecord({ id: "u", kind: "url", value: "https://example.com" }),
    ]);

    expect(message.records).toEqual([
      { recordType: "text", data: "hello" },
      { recordType: "url", data: "https://example.com" },
    ]);
  });

  it("json は mime + Uint8Array に変換する", () => {
    const message = buildNdefMessageInit([
      createRecord({ id: "j", kind: "json", value: '{ "ok": true }' }),
    ]);

    const record = message.records[0];
    expect(record?.recordType).toBe("mime");
    expect(record?.mediaType).toBe("application/json");
    expect(ArrayBuffer.isView(record?.data)).toBe(true);
    expect(new TextDecoder().decode(record?.data as BufferSource)).toBe('{"ok":true}');
  });

  it("不正な下書きは例外を投げる", () => {
    expect(() => buildNdefMessageInit([])).toThrow("書き込むレコードを追加してください。");
    expect(() =>
      buildNdefMessageInit([createRecord({ kind: "url", value: "javascript:void(0)" })])
    ).toThrow("有効な URL（https://... など）を入力してください。");
  });
});

describe("getWriteRecordKindLabel", () => {
  it("各種別のラベルを返す", () => {
    expect(getWriteRecordKindLabel("text")).toBe("text");
    expect(getWriteRecordKindLabel("url")).toBe("url");
    expect(getWriteRecordKindLabel("json")).toBe("json");
  });
});

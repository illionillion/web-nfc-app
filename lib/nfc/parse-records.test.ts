import { describe, expect, it } from "vitest";

import { getRecordKindLabel, parseNdefRecord, parseNdefRecords } from "@/lib/nfc/parse-records";

/**
 * 文字列から DataView を作る。
 *
 * @param value - 文字列
 * @returns DataView
 */
function toDataView(value: string): DataView {
  const bytes = new TextEncoder().encode(value);
  return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
}

/**
 * テスト用の NDEFRecord 風オブジェクトを作る。
 *
 * @param init - レコード初期値
 * @returns 擬似 NDEFRecord
 */
function createRecord(init: {
  recordType: string;
  mediaType?: string;
  encoding?: string;
  data?: string;
}): NDEFRecord {
  return {
    recordType: init.recordType,
    mediaType: init.mediaType,
    encoding: init.encoding,
    data: init.data === undefined ? undefined : toDataView(init.data),
  } as NDEFRecord;
}

describe("parseNdefRecord", () => {
  it("text レコードを正規化する", () => {
    const parsed = parseNdefRecord(
      createRecord({
        recordType: "text",
        encoding: "utf-8",
        data: "hello",
      })
    );

    expect(parsed).toEqual({
      kind: "text",
      recordType: "text",
      mediaType: undefined,
      text: "hello",
    });
  });

  it("url レコードを正規化する", () => {
    const parsed = parseNdefRecord(
      createRecord({
        recordType: "url",
        data: "https://example.com",
      })
    );

    expect(parsed).toEqual({
      kind: "url",
      recordType: "url",
      mediaType: undefined,
      text: "https://example.com",
    });
  });

  it("application/json の mime レコードを整形する", () => {
    const parsed = parseNdefRecord(
      createRecord({
        recordType: "mime",
        mediaType: "application/json",
        data: '{"a":1}',
      })
    );

    expect(parsed.kind).toBe("json");
    expect(parsed.mediaType).toBe("application/json");
    expect(parsed.text).toBe('{\n  "a": 1\n}');
  });

  it("不正な JSON mime は原文のまま unknown ではなく json として残す", () => {
    const parsed = parseNdefRecord(
      createRecord({
        recordType: "mime",
        mediaType: "application/json",
        data: "{broken",
      })
    );

    expect(parsed.kind).toBe("json");
    expect(parsed.text).toBe("{broken");
  });

  it("未知のレコードを unknown にする", () => {
    const parsed = parseNdefRecord(
      createRecord({
        recordType: "absolute-url",
        data: "https://example.com/abs",
      })
    );

    expect(parsed).toEqual({
      kind: "unknown",
      recordType: "absolute-url",
      mediaType: undefined,
      text: "https://example.com/abs",
    });
  });

  it("data が無い未知レコードはフォールバック文言になる", () => {
    const parsed = parseNdefRecord(
      createRecord({
        recordType: "absolute-url",
      })
    );

    expect(parsed.kind).toBe("unknown");
    expect(parsed.text).toBe("(変換できないレコード)");
  });
});

describe("parseNdefRecords", () => {
  it("複数レコードを順に変換する", () => {
    const parsed = parseNdefRecords([
      createRecord({ recordType: "text", data: "a" }),
      createRecord({ recordType: "url", data: "https://example.com" }),
    ]);

    expect(parsed.map((record) => record.kind)).toEqual(["text", "url"]);
  });

  it("消去済みタグの empty レコードは除外する", () => {
    const parsed = parseNdefRecords([createRecord({ recordType: "empty" })]);

    expect(parsed).toEqual([]);
  });
});

describe("getRecordKindLabel", () => {
  it("各種別のラベルを返す", () => {
    expect(getRecordKindLabel("text")).toBe("text");
    expect(getRecordKindLabel("url")).toBe("url");
    expect(getRecordKindLabel("json")).toBe("json");
    expect(getRecordKindLabel("unknown")).toBe("unknown");
  });
});

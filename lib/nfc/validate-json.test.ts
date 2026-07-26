import { describe, expect, it } from "vitest";

import { validateJsonText } from "@/lib/nfc/validate-json";

describe("validateJsonText", () => {
  it("空入力は内容が空ですと返す", () => {
    expect(validateJsonText("")).toBe("内容が空です。");
    expect(validateJsonText("   \n\t")).toBe("内容が空です。");
  });

  it("正しい JSON は null を返す", () => {
    expect(validateJsonText('{"ok": true}')).toBeNull();
    expect(validateJsonText("[1, 2]")).toBeNull();
  });

  it("引用符が閉じられていないとき専用メッセージを返す", () => {
    expect(validateJsonText('{"name": "alice')).toBe('文字列の引用符 (") が閉じられていません。');
  });

  it("末尾カンマのとき専用メッセージを返す", () => {
    expect(validateJsonText('{"a": 1,}')).toBe("末尾のカンマ (,) は JSON では使えません。");
    expect(validateJsonText("[1,]")).toBe("末尾のカンマ (,) は JSON では使えません。");
  });

  it("閉じ括弧 } が不足しているとき専用メッセージを返す", () => {
    expect(validateJsonText('{"a": 1')).toBe("オブジェクトの閉じ括弧 } が不足しています。");
  });

  it("閉じ括弧 } が多すぎるとき専用メッセージを返す", () => {
    expect(validateJsonText('{"a": 1}}')).toBe(
      "オブジェクトの開き括弧 { と閉じ括弧 } の数が合いません。"
    );
  });

  it("閉じ括弧 ] が不足しているとき専用メッセージを返す", () => {
    expect(validateJsonText("[1, 2")).toBe("配列の閉じ括弧 ] が不足しています。");
  });

  it("閉じ括弧 ] が多すぎるとき専用メッセージを返す", () => {
    expect(validateJsonText("[1, 2]]")).toBe("配列の開き括弧 [ と閉じ括弧 ] の数が合いません。");
  });

  it("その他の構文エラーは汎用メッセージを返す", () => {
    expect(validateJsonText("{a}")).toMatch(/JSON/);
  });
});

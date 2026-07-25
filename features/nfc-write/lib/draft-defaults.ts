import type { WriteRecordKind } from "@/features/nfc-write/types";

/**
 * 種別ごとの初期値。
 *
 * @param kind - 種別
 * @returns 初期文字列
 */
export function defaultValueForKind(kind: WriteRecordKind): string {
  switch (kind) {
    case "text":
      return "";
    case "url":
      return "";
    case "json":
      return "{\n  \n}";
  }
}

/**
 * モーダル内で種別切替時に保持する値キャッシュを作る。
 * 開いた時点の種別・値だけ実値を入れ、他は種別ごとの初期値にする。
 *
 * @param seed - 編集開始時のレコード
 * @returns text / url / json の値マップ
 */
export function createKindValueCache(seed: {
  kind: WriteRecordKind;
  value: string;
}): Record<WriteRecordKind, string> {
  return {
    text: defaultValueForKind("text"),
    url: defaultValueForKind("url"),
    json: defaultValueForKind("json"),
    [seed.kind]: seed.value,
  };
}

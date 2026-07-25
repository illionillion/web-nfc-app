import type { NfcReadResult } from "@/features/nfc-read/types";

/**
 * 読取結果をクリップボード用のプレーンテキストに整形する。
 *
 * @param result - 読取結果
 * @returns コピー用文字列
 */
export function formatReadResultForClipboard(result: NfcReadResult): string {
  const lines = [
    `serialNumber: ${result.serialNumber || "(none)"}`,
    `readAt: ${result.readAt}`,
    "records:",
    ...result.records.map((record, index) => {
      const header = `  [${index}] ${record.kind}${record.mediaType ? ` (${record.mediaType})` : ""}`;
      return `${header}\n${indentBlock(record.text, 4)}`;
    }),
  ];

  return lines.join("\n");
}

/**
 * 複数行テキストをインデントする。
 *
 * @param text - 本文
 * @param spaces - インデント幅
 * @returns インデント済みテキスト
 */
function indentBlock(text: string, spaces: number): string {
  const pad = " ".repeat(spaces);
  return text
    .split("\n")
    .map((line) => `${pad}${line}`)
    .join("\n");
}

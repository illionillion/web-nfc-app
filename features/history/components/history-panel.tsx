"use client";

import { clsx } from "clsx";

import type { HistoryEntry } from "@/features/history/types";

type HistoryPanelProps = {
  entries: HistoryEntry[];
  onPreview: (entry: HistoryEntry) => void;
  onWriteThis: (entry: HistoryEntry) => void;
  onRemove: (entry: HistoryEntry) => void;
  onClear: () => void;
};

/**
 * 読取・書込履歴の一覧。
 */
export function HistoryPanel({
  entries,
  onPreview,
  onWriteThis,
  onRemove,
  onClear,
}: HistoryPanelProps) {
  if (entries.length === 0) {
    return (
      <p
        className={clsx([
          "rounded-md",
          "border",
          "border-dashed",
          "border-zinc-300",
          "px-3",
          "py-6",
          "text-center",
          "text-sm",
          "text-zinc-500",
        ])}
      >
        履歴はまだありません
      </p>
    );
  }

  return (
    <div className={clsx(["space-y-3"])}>
      <div className={clsx(["flex", "items-center", "justify-between", "gap-2"])}>
        <p className={clsx(["text-sm", "text-zinc-600"])}>{entries.length} 件（最大 100）</p>
        <button
          type="button"
          className={clsx([
            "rounded-md",
            "border",
            "border-zinc-300",
            "bg-white",
            "px-3",
            "py-1.5",
            "text-xs",
            "font-medium",
            "text-red-700",
          ])}
          onClick={onClear}
        >
          履歴を消す
        </button>
      </div>
      <ul className={clsx(["space-y-3"])}>
        {entries.map((entry, index) => (
          <li key={entry.id}>
            <article
              className={clsx([
                "space-y-2",
                "rounded-md",
                "border",
                "border-zinc-200",
                "bg-zinc-50",
                "p-3",
              ])}
            >
              <header className={clsx(["space-y-1"])}>
                <p className={clsx(["text-sm", "font-medium", "text-zinc-900"])}>
                  {entry.source === "read" ? "読取" : "書込"} · レコード {entry.records.length}
                </p>
                <p className={clsx(["text-xs", "text-zinc-500"])}>
                  {formatDateTime(entry.createdAt)}
                  {entry.serialNumber ? ` · ${entry.serialNumber}` : ""}
                </p>
                <p className={clsx(["truncate", "font-mono", "text-xs", "text-zinc-700"])}>
                  {summarizeRecords(entry)}
                </p>
              </header>
              <div className={clsx(["flex", "flex-wrap", "gap-2"])}>
                <button
                  type="button"
                  className={clsx([
                    "rounded-md",
                    "border",
                    "border-zinc-300",
                    "bg-white",
                    "px-3",
                    "py-1.5",
                    "text-xs",
                    "font-medium",
                  ])}
                  onClick={() => onPreview(entry)}
                >
                  再表示
                </button>
                <button
                  type="button"
                  className={clsx([
                    "rounded-md",
                    "border",
                    "border-zinc-300",
                    "bg-white",
                    "px-3",
                    "py-1.5",
                    "text-xs",
                    "font-medium",
                  ])}
                  disabled={!entry.records.some((record) => record.kind !== "unknown")}
                  onClick={() => onWriteThis(entry)}
                >
                  この内容で書く
                </button>
                <button
                  type="button"
                  aria-label={`履歴 ${index + 1} を削除`}
                  className={clsx([
                    "rounded-md",
                    "border",
                    "border-zinc-300",
                    "bg-white",
                    "px-3",
                    "py-1.5",
                    "text-xs",
                    "font-medium",
                    "text-red-700",
                  ])}
                  onClick={() => onRemove(entry)}
                >
                  削除
                </button>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * 日時を表示用に整形する。
 *
 * @param iso - ISO 文字列
 * @returns 表示用
 */
function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleString("ja-JP");
}

/**
 * レコードの要約テキスト。
 *
 * @param entry - 履歴
 * @returns 要約
 */
function summarizeRecords(entry: HistoryEntry): string {
  if (entry.records.length === 0) {
    return "(空)";
  }
  const first = entry.records[0];
  const preview = first?.text.trim() || "(空)";
  return preview.length > 80 ? `${preview.slice(0, 80)}…` : preview;
}

"use client";

import { clsx } from "clsx";
import { useState } from "react";

import type { NfcScanPhase } from "@/features/nfc-read/hooks/use-nfc-scan";
import type { NfcReadResult, ParsedNdefRecord } from "@/features/nfc-read/types";
import { formatReadResultForClipboard } from "@/lib/nfc/format-read-result";
import { getRecordKindLabel } from "@/lib/nfc/parse-records";

type ReadResultPanelProps = {
  phase: NfcScanPhase;
  result: NfcReadResult | null;
  errorMessage: string | null;
};

/**
 * 「いまの結果」セクションの表示とコピー操作。
 */
export function ReadResultPanel({ phase, result, errorMessage }: ReadResultPanelProps) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");

  if (phase === "scanning") {
    return <StatusText>スキャン中です。タグをかざしてください。</StatusText>;
  }

  if (phase === "cancelled") {
    return <StatusText>スキャンをキャンセルしました。</StatusText>;
  }

  if (phase === "error") {
    return (
      <p className={clsx(["text-sm", "text-red-700"])} role="alert">
        {errorMessage ?? "読み取りに失敗しました。"}
      </p>
    );
  }

  if (!result) {
    return <StatusText>まだ読み取っていません</StatusText>;
  }

  return (
    <div className={clsx(["space-y-4"])}>
      <dl className={clsx(["space-y-2", "text-sm"])}>
        <div className={clsx(["space-y-1"])}>
          <dt className={clsx(["font-medium", "text-zinc-500"])}>シリアル番号</dt>
          <dd className={clsx(["break-all", "font-mono", "text-zinc-900"])}>
            {result.serialNumber || "(なし)"}
          </dd>
        </div>
        <div className={clsx(["space-y-1"])}>
          <dt className={clsx(["font-medium", "text-zinc-500"])}>読取日時</dt>
          <dd className={clsx(["text-zinc-900"])}>{formatReadAt(result.readAt)}</dd>
        </div>
      </dl>

      <div className={clsx(["space-y-2"])}>
        <p className={clsx(["text-sm", "font-medium", "text-zinc-500"])}>
          レコード（{result.records.length}）
        </p>
        {result.records.length === 0 ? (
          <StatusText>レコードはありません（空のタグの可能性があります）</StatusText>
        ) : (
          <ul className={clsx(["space-y-3"])}>
            {result.records.map((record, index) => (
              <li key={`${record.kind}-${index}`}>
                <RecordCard record={record} index={index} />
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={clsx(["flex", "flex-wrap", "items-center", "gap-2"])}>
        <button
          type="button"
          className={clsx([
            "min-h-11",
            "rounded-md",
            "border",
            "border-zinc-300",
            "bg-white",
            "px-4",
            "py-2",
            "text-sm",
            "font-medium",
            "text-zinc-900",
          ])}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(formatReadResultForClipboard(result));
              setCopyState("copied");
            } catch {
              setCopyState("failed");
            }
          }}
        >
          結果をコピー
        </button>
        {copyState === "copied" ? (
          <span className={clsx(["text-sm", "text-emerald-700"])}>コピーしました</span>
        ) : null}
        {copyState === "failed" ? (
          <span className={clsx(["text-sm", "text-red-700"])}>コピーに失敗しました</span>
        ) : null}
      </div>
    </div>
  );
}

type RecordCardProps = {
  record: ParsedNdefRecord;
  index: number;
};

/**
 * 1レコード分の表示カード。
 */
function RecordCard({ record, index }: RecordCardProps) {
  return (
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
      <header className={clsx(["flex", "items-center", "justify-between", "gap-2"])}>
        <p className={clsx(["text-sm", "font-medium", "text-zinc-900"])}>
          #{index + 1} {getRecordKindLabel(record.kind)}
        </p>
        {record.mediaType ? (
          <p className={clsx(["text-xs", "text-zinc-500"])}>{record.mediaType}</p>
        ) : null}
      </header>
      <pre
        className={clsx([
          "overflow-x-auto",
          "whitespace-pre-wrap",
          "break-all",
          "font-mono",
          "text-xs",
          "leading-5",
          "text-zinc-800",
        ])}
      >
        {record.text || "(空)"}
      </pre>
    </article>
  );
}

type StatusTextProps = {
  children: string;
};

/**
 * 結果未取得時などの説明文。
 */
function StatusText({ children }: StatusTextProps) {
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
      {children}
    </p>
  );
}

/**
 * ISO 日時を読みやすい表示にする。
 *
 * @param iso - ISO 文字列
 * @returns 表示用
 */
function formatReadAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleString("ja-JP");
}

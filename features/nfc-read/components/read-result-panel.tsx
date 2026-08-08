"use client";

import { clsx } from "clsx";
import { ClipboardCopy } from "lucide-react";
import { toast } from "sonner";

import type { NfcScanPhase } from "@/features/nfc-read/hooks/use-nfc-scan";
import type { NfcReadResult, ParsedNdefRecord } from "@/features/nfc-read/types";
import { formatReadResultForClipboard } from "@/lib/nfc/format-read-result";
import { getRecordKindLabel } from "@/lib/nfc/parse-records";

type ReadResultPanelProps = {
  phase: NfcScanPhase;
  result: NfcReadResult | null;
  errorMessage: string | null;
  /** 「この内容で書く」ハンドラ。未指定ならボタン非表示 */
  onWriteThis?: (result: NfcReadResult) => void;
  /** 表示中の結果を消すハンドラ。未指定ならボタン非表示 */
  onReset?: () => void;
};

/**
 * 「いまの結果」セクションの表示とコピー操作。
 */
export function ReadResultPanel({
  phase,
  result,
  errorMessage,
  onWriteThis,
  onReset,
}: ReadResultPanelProps) {
  if (phase === "scanning") {
    return <StatusText>スキャン中です。タグをかざしてください。</StatusText>;
  }

  if (phase === "cancelled") {
    return <StatusText>スキャンをキャンセルしました。</StatusText>;
  }

  if (phase === "error") {
    return (
      <p className={clsx(["text-sm", "text-red-700", "dark:text-red-400"])} role="alert">
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
          <dt className={clsx(["font-medium", "text-muted"])}>シリアル番号</dt>
          <dd className={clsx(["break-all", "font-mono", "text-foreground"])}>
            {result.serialNumber || "(なし)"}
          </dd>
        </div>
        <div className={clsx(["space-y-1"])}>
          <dt className={clsx(["font-medium", "text-muted"])}>読取日時</dt>
          <dd className={clsx(["text-foreground"])}>{formatReadAt(result.readAt)}</dd>
        </div>
      </dl>

      <div className={clsx(["space-y-2"])}>
        <p className={clsx(["text-sm", "font-medium", "text-muted"])}>
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
            "border-border",
            "bg-surface",
            "px-4",
            "py-2",
            "text-sm",
            "font-medium",
            "text-foreground",
          ])}
          onClick={() => {
            void copyTextToClipboard(formatReadResultForClipboard(result));
          }}
        >
          結果をコピー
        </button>
        {onWriteThis ? (
          <button
            type="button"
            className={clsx([
              "min-h-11",
              "rounded-md",
              "border",
              "border-foreground",
              "bg-foreground",
              "px-4",
              "py-2",
              "text-sm",
              "font-medium",
              "text-background",
              "disabled:cursor-not-allowed",
              "disabled:opacity-40",
            ])}
            disabled={!result.records.some((record) => record.kind !== "unknown")}
            onClick={() => onWriteThis(result)}
          >
            この内容で書く
          </button>
        ) : null}
        {onReset ? (
          <button
            type="button"
            className={clsx([
              "min-h-11",
              "rounded-md",
              "border",
              "border-border",
              "bg-surface",
              "px-4",
              "py-2",
              "text-sm",
              "font-medium",
              "text-red-700",
              "dark:text-red-400",
            ])}
            onClick={onReset}
          >
            結果をクリア
          </button>
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
  const payload = record.text || "";

  return (
    <article
      className={clsx([
        "relative",
        "space-y-2",
        "rounded-md",
        "border",
        "border-border",
        "bg-surface",
        "p-3",
        "pr-12",
      ])}
    >
      <button
        type="button"
        aria-label={`レコード ${index + 1} をコピー`}
        title="コピー"
        disabled={!payload}
        className={clsx([
          "absolute",
          "top-3",
          "right-3",
          "inline-flex",
          "size-8",
          "items-center",
          "justify-center",
          "rounded-md",
          "border",
          "border-border",
          "bg-background",
          "text-foreground",
          "disabled:cursor-not-allowed",
          "disabled:opacity-40",
        ])}
        onClick={() => {
          void copyTextToClipboard(payload);
        }}
      >
        <ClipboardCopy aria-hidden="true" className={clsx(["size-4"])} />
      </button>
      <header className={clsx(["flex", "items-center", "justify-between", "gap-2"])}>
        <p className={clsx(["text-sm", "font-medium", "text-foreground"])}>
          #{index + 1} {getRecordKindLabel(record.kind)}
        </p>
        {record.mediaType ? (
          <p className={clsx(["text-xs", "text-muted"])}>{record.mediaType}</p>
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
          "text-foreground",
        ])}
      >
        {payload || "(空)"}
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
        "border-border",
        "px-3",
        "py-6",
        "text-center",
        "text-sm",
        "text-muted",
      ])}
    >
      {children}
    </p>
  );
}

/**
 * クリップボードへ書き込み、結果をトーストで通知する。
 *
 * @param text - コピーする文字列
 */
async function copyTextToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    toast.success("コピーしました");
  } catch {
    toast.error("コピーに失敗しました");
  }
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

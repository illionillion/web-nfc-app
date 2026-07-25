"use client";

import { clsx } from "clsx";
import { useState } from "react";

import { RecordEditModal } from "@/features/nfc-write/components/record-edit-modal";
import type { NfcWritePhase, WriteDraftRecord, WriteRecordKind } from "@/features/nfc-write/types";
import {
  getWriteRecordKindLabel,
  validateWriteDraft,
  validateWriteDraftRecord,
} from "@/lib/nfc/build-ndef-message";

type WriteDraftPanelProps = {
  records: WriteDraftRecord[];
  writePhase: NfcWritePhase;
  writeErrorMessage: string | null;
  onAdd: (kind: WriteRecordKind) => WriteDraftRecord;
  onUpdate: (record: WriteDraftRecord) => void;
  onRemove: (id: string) => void;
};

/**
 * 書込内容セクション。一覧 + 追加 + モーダル編集。
 */
export function WriteDraftPanel({
  records,
  writePhase,
  writeErrorMessage,
  onAdd,
  onUpdate,
  onRemove,
}: WriteDraftPanelProps) {
  const [editing, setEditing] = useState<WriteDraftRecord | null>(null);
  const draftIssue = validateWriteDraft(records);

  return (
    <div className={clsx(["space-y-4"])}>
      <WriteStatus
        phase={writePhase}
        errorMessage={writeErrorMessage}
        draftIssueMessage={
          records.length > 0 &&
          (writePhase === "idle" || writePhase === "success" || writePhase === "cancelled")
            ? (draftIssue?.message ?? null)
            : null
        }
      />

      <div className={clsx(["flex", "flex-wrap", "gap-2"])}>
        {(["text", "url", "json"] as const).map((kind) => (
          <button
            key={kind}
            type="button"
            className={clsx([
              "min-h-11",
              "rounded-md",
              "border",
              "border-zinc-300",
              "bg-white",
              "px-3",
              "text-sm",
              "font-medium",
              "text-zinc-900",
            ])}
            onClick={() => {
              const created = onAdd(kind);
              setEditing(created);
            }}
          >
            {getWriteRecordKindLabel(kind)} を追加
          </button>
        ))}
      </div>

      {records.length === 0 ? (
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
          下書きはまだありません。レコードを追加してください。
        </p>
      ) : (
        <ul className={clsx(["space-y-3"])}>
          {records.map((record, index) => {
            const issue = validateWriteDraftRecord(record);
            return (
              <li key={record.id}>
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
                  <header className={clsx(["flex", "items-start", "justify-between", "gap-2"])}>
                    <div className={clsx(["space-y-1"])}>
                      <p className={clsx(["text-sm", "font-medium", "text-zinc-900"])}>
                        #{index + 1} {getWriteRecordKindLabel(record.kind)}
                      </p>
                      {issue ? (
                        <p className={clsx(["text-xs", "text-red-700"])}>{issue.message}</p>
                      ) : null}
                    </div>
                    <div className={clsx(["flex", "gap-2"])}>
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
                        onClick={() => setEditing(record)}
                      >
                        編集
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
                          "text-red-700",
                        ])}
                        onClick={() => onRemove(record.id)}
                      >
                        削除
                      </button>
                    </div>
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
                    {record.value.trim() || "(空)"}
                  </pre>
                </article>
              </li>
            );
          })}
        </ul>
      )}

      {editing ? (
        <RecordEditModal
          record={editing}
          onClose={() => setEditing(null)}
          onSave={(next) => {
            onUpdate(next);
            setEditing(null);
          }}
        />
      ) : null}
    </div>
  );
}

type WriteStatusProps = {
  phase: NfcWritePhase;
  errorMessage: string | null;
  draftIssueMessage: string | null;
};

/**
 * 書込状態の表示。
 */
function WriteStatus({ phase, errorMessage, draftIssueMessage }: WriteStatusProps) {
  if (phase === "writing") {
    return (
      <p className={clsx(["text-sm", "text-zinc-600"])}>書き込み中です。タグをかざしてください。</p>
    );
  }

  if (phase === "success") {
    return <p className={clsx(["text-sm", "text-emerald-700"])}>書き込みが完了しました。</p>;
  }

  if (phase === "cancelled") {
    return <p className={clsx(["text-sm", "text-zinc-600"])}>書き込みをキャンセルしました。</p>;
  }

  if (phase === "error") {
    return (
      <p className={clsx(["text-sm", "text-red-700"])} role="alert">
        {errorMessage ?? "書き込みに失敗しました。"}
      </p>
    );
  }

  if (draftIssueMessage) {
    return (
      <p className={clsx(["text-sm", "text-amber-700"])} role="status">
        書き込みできません: {draftIssueMessage}
      </p>
    );
  }

  return null;
}

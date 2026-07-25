"use client";

import { clsx } from "clsx";
import { useEffect, useId, useRef, useState } from "react";

import { JsonCodeEditor } from "@/features/nfc-write/components/json-code-editor";
import type { WriteDraftRecord, WriteRecordKind } from "@/features/nfc-write/types";
import { getWriteRecordKindLabel, validateWriteDraftRecord } from "@/lib/nfc/build-ndef-message";

type RecordEditModalProps = {
  record: WriteDraftRecord;
  onClose: () => void;
  onSave: (next: WriteDraftRecord) => void;
};

/**
 * レコード編集モーダル。種別ごとに入力 UI を切り替える。
 */
export function RecordEditModal({ record, onClose, onSave }: RecordEditModalProps) {
  const titleId = useId();
  const inputId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [kind, setKind] = useState<WriteRecordKind>(record.kind);
  const [value, setValue] = useState(record.value);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }
    if (!dialog.open) {
      dialog.showModal();
    }

    const onCancel = (event: Event) => {
      event.preventDefault();
      onClose();
    };
    dialog.addEventListener("cancel", onCancel);
    return () => {
      dialog.removeEventListener("cancel", onCancel);
    };
  }, [onClose]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      className={clsx([
        "m-auto",
        "w-[min(100%,28rem)]",
        "rounded-lg",
        "border",
        "border-zinc-200",
        "bg-white",
        "p-0",
        "text-zinc-900",
        "shadow-lg",
        "backdrop:bg-zinc-900/40",
      ])}
      onClick={(event) => {
        if (event.target === dialogRef.current) {
          onClose();
        }
      }}
    >
      <form
        className={clsx(["space-y-4", "p-4"])}
        onSubmit={(event) => {
          event.preventDefault();
          const next: WriteDraftRecord = { ...record, kind, value };
          const issue = validateWriteDraftRecord(next);
          if (issue) {
            setError(issue.message);
            return;
          }
          onSave(next);
        }}
      >
        <header className={clsx(["space-y-1"])}>
          <h2 id={titleId} className={clsx(["text-lg", "font-semibold"])}>
            レコードを編集
          </h2>
          <p className={clsx(["text-sm", "text-zinc-600"])}>
            種別ごとに入力欄が切り替わります。保存時にバリデーションします。
          </p>
        </header>

        <div className={clsx(["space-y-2"])}>
          <label htmlFor={`${inputId}-kind`} className={clsx(["text-sm", "font-medium"])}>
            種別
          </label>
          <select
            id={`${inputId}-kind`}
            value={kind}
            className={clsx([
              "min-h-11",
              "w-full",
              "rounded-md",
              "border",
              "border-zinc-300",
              "bg-white",
              "px-3",
              "text-sm",
            ])}
            onChange={(event) => {
              setKind(event.target.value as WriteRecordKind);
              setError(null);
            }}
          >
            {(["text", "url", "json"] as const).map((option) => (
              <option key={option} value={option}>
                {getWriteRecordKindLabel(option)}
              </option>
            ))}
          </select>
        </div>

        <div className={clsx(["space-y-2"])}>
          <label htmlFor={inputId} className={clsx(["text-sm", "font-medium"])}>
            内容
          </label>
          {kind === "text" ? (
            <textarea
              id={inputId}
              value={value}
              rows={6}
              className={clsx([
                "w-full",
                "rounded-md",
                "border",
                "border-zinc-300",
                "px-3",
                "py-2",
                "text-sm",
              ])}
              onChange={(event) => {
                setValue(event.target.value);
                setError(null);
              }}
            />
          ) : null}
          {kind === "url" ? (
            <input
              id={inputId}
              type="url"
              value={value}
              placeholder="https://example.com"
              className={clsx([
                "min-h-11",
                "w-full",
                "rounded-md",
                "border",
                "border-zinc-300",
                "px-3",
                "text-sm",
              ])}
              onChange={(event) => {
                setValue(event.target.value);
                setError(null);
              }}
            />
          ) : null}
          {kind === "json" ? (
            <JsonCodeEditor
              id={inputId}
              value={value}
              invalid={Boolean(error)}
              onChange={(next) => {
                setValue(next);
                setError(null);
              }}
            />
          ) : null}
        </div>

        {error ? (
          <p className={clsx(["text-sm", "text-red-700"])} role="alert">
            {error}
          </p>
        ) : null}

        <div className={clsx(["flex", "justify-end", "gap-2"])}>
          <button
            type="button"
            className={clsx([
              "min-h-11",
              "rounded-md",
              "border",
              "border-zinc-300",
              "bg-white",
              "px-4",
              "text-sm",
              "font-medium",
            ])}
            onClick={onClose}
          >
            キャンセル
          </button>
          <button
            type="submit"
            className={clsx([
              "min-h-11",
              "rounded-md",
              "border",
              "border-zinc-900",
              "bg-zinc-900",
              "px-4",
              "text-sm",
              "font-medium",
              "text-white",
            ])}
          >
            保存
          </button>
        </div>
      </form>
    </dialog>
  );
}

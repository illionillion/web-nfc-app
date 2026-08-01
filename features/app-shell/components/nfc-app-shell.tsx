"use client";

import { clsx } from "clsx";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { ActionBar } from "@/features/app-shell/components/action-bar";
import { NfcSupportBanner } from "@/features/app-shell/components/nfc-support-banner";
import { ShellSection } from "@/features/app-shell/components/shell-section";
import { useNfcSupport } from "@/features/app-shell/hooks/use-nfc-support";
import { HistoryPanel } from "@/features/history/components/history-panel";
import { useNfcHistory } from "@/features/history/hooks/use-nfc-history";
import type { HistoryEntry } from "@/features/history/types";
import { ReadResultPanel } from "@/features/nfc-read/components/read-result-panel";
import { useNfcScan } from "@/features/nfc-read/hooks/use-nfc-scan";
import type { NfcReadResult } from "@/features/nfc-read/types";
import { WriteDraftPanel } from "@/features/nfc-write/components/write-draft-panel";
import { useNfcErase } from "@/features/nfc-write/hooks/use-nfc-erase";
import { useNfcWrite } from "@/features/nfc-write/hooks/use-nfc-write";
import { useWriteDraft } from "@/features/nfc-write/hooks/use-write-draft";
import { validateWriteDraft } from "@/lib/nfc/build-ndef-message";
import {
  historyRecordsToParsed,
  historyRecordsToWriteDraft,
  parsedRecordsToWriteDraft,
  writeDraftToHistoryRecords,
} from "@/lib/nfc/record-handoff";

/**
 * Web NFC ツール本体のシェル。
 * 対応判定・読取・書込・消去・履歴を担当する。
 */
export function NfcAppShell() {
  const support = useNfcSupport();
  const {
    phase,
    result,
    errorMessage,
    isSessionActive: isScanSessionActive,
    startScan,
    cancelScan,
    resetScan,
  } = useNfcScan();
  const {
    phase: writePhase,
    errorMessage: writeErrorMessage,
    isSessionActive: isWriteSessionActive,
    startWrite,
    cancelWrite,
  } = useNfcWrite();
  const {
    phase: erasePhase,
    errorMessage: eraseErrorMessage,
    isSessionActive: isEraseSessionActive,
    startErase,
    cancelErase,
  } = useNfcErase();
  const { records, appendRecord, updateRecord, removeRecord, replaceRecords } = useWriteDraft();
  const { entries, addEntry, removeEntry, clearEntries } = useNfcHistory();

  const [historyPreview, setHistoryPreview] = useState<NfcReadResult | null>(null);
  const writeSectionRef = useRef<HTMLElement>(null);
  const previousScanPhaseRef = useRef(phase);
  const previousWritePhaseRef = useRef(writePhase);
  const previousErasePhaseRef = useRef(erasePhase);

  const unsupported = support.kind !== "supported";
  const isScanning = phase === "scanning";
  const isWriting = writePhase === "writing";
  const isErasing = erasePhase === "writing";
  const nfcLocked = isScanSessionActive || isWriteSessionActive || isEraseSessionActive;
  const canWrite = !unsupported && validateWriteDraft(records) === null;

  const panelResult = historyPreview ?? result;
  const panelPhase = historyPreview ? "success" : phase;

  useEffect(() => {
    if (previousScanPhaseRef.current !== "success" && phase === "success" && result) {
      setHistoryPreview(null);
      addEntry({
        source: "read",
        serialNumber: result.serialNumber,
        records: result.records,
      });
    }
    previousScanPhaseRef.current = phase;
  }, [phase, result, addEntry]);

  useEffect(() => {
    if (previousWritePhaseRef.current !== "success" && writePhase === "success") {
      addEntry({
        source: "write",
        records: writeDraftToHistoryRecords(records),
      });
    }
    previousWritePhaseRef.current = writePhase;
  }, [writePhase, records, addEntry]);

  useEffect(() => {
    if (previousErasePhaseRef.current !== "success" && erasePhase === "success") {
      toast.success("消去が完了しました");
    }
    if (previousErasePhaseRef.current !== "error" && erasePhase === "error") {
      toast.error(eraseErrorMessage ?? "消去に失敗しました");
    }
    previousErasePhaseRef.current = erasePhase;
  }, [erasePhase, eraseErrorMessage]);

  /**
   * 履歴または読取結果を書込下書きへ載せる。
   *
   * @param nextRecords - 下書きレコード
   */
  function applyWriteThis(nextRecords: ReturnType<typeof parsedRecordsToWriteDraft>) {
    if (nextRecords.length === 0) {
      toast.error("書込可能なレコードがありません");
      return;
    }
    replaceRecords(nextRecords);
    toast.success("書込内容に引き継ぎました");
    scrollToWriteSection();
  }

  /**
   * 引き継ぎ先が見えるよう書込セクションまでスクロールする。
   */
  function scrollToWriteSection() {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    writeSectionRef.current?.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });
  }

  /**
   * 履歴エントリを「いまの結果」へ再表示する。
   *
   * @param entry - 履歴
   */
  function previewHistoryEntry(entry: HistoryEntry) {
    setHistoryPreview({
      serialNumber: entry.serialNumber,
      records: historyRecordsToParsed(entry.records),
      readAt: entry.createdAt,
    });
  }

  return (
    <div
      className={clsx([
        "mx-auto",
        "flex",
        "w-full",
        "max-w-lg",
        "flex-col",
        "gap-6",
        "px-4",
        "py-8",
      ])}
    >
      <header className={clsx(["space-y-3"])}>
        <div className={clsx(["space-y-1"])}>
          <p
            className={clsx([
              "text-xs",
              "font-medium",
              "uppercase",
              "tracking-wider",
              "text-zinc-500",
            ])}
          >
            Web NFC
          </p>
          <h1 className={clsx(["text-2xl", "font-semibold", "tracking-tight"])}>読み書きツール</h1>
          <p className={clsx(["text-sm", "text-zinc-600"])}>
            ブラウザだけで NDEF タグを読み書きします。モード切替ではなく、操作ボタンで進めます。
          </p>
        </div>
        <NfcSupportBanner status={support} />
      </header>

      <div
        className={clsx([
          "sticky",
          "top-14",
          "z-40",
          "-mx-4",
          "border-b",
          "border-zinc-200",
          "bg-white",
          "px-4",
          "py-3",
        ])}
      >
        <ActionBar
          disabled={unsupported}
          isScanning={isScanning}
          isWriting={isWriting}
          isErasing={isErasing}
          nfcLocked={nfcLocked}
          canWrite={canWrite}
          onScan={
            unsupported
              ? undefined
              : () => {
                  cancelWrite();
                  cancelErase();
                  setHistoryPreview(null);
                  void startScan();
                }
          }
          onCancelScan={cancelScan}
          onWrite={
            unsupported
              ? undefined
              : () => {
                  cancelScan();
                  cancelErase();
                  void startWrite(records);
                }
          }
          onCancelWrite={cancelWrite}
          onErase={
            unsupported
              ? undefined
              : () => {
                  const confirmed = window.confirm(
                    "タグの内容を消去します。よろしいですか？（空の NDEF で上書きします）"
                  );
                  if (!confirmed) {
                    return;
                  }
                  cancelScan();
                  cancelWrite();
                  void startErase();
                }
          }
          onCancelErase={cancelErase}
        />
      </div>

      <ShellSection title="いまの結果" description="スキャンしたタグの内容がここに表示されます。">
        <ReadResultPanel
          key={
            historyPreview
              ? `history-${historyPreview.readAt}`
              : phase === "success" && result
                ? result.readAt
                : phase
          }
          phase={panelPhase}
          result={panelResult}
          errorMessage={errorMessage}
          onWriteThis={(current) => {
            applyWriteThis(parsedRecordsToWriteDraft(current.records));
          }}
          onReset={() => {
            setHistoryPreview(null);
            resetScan();
          }}
        />
      </ShellSection>

      <ShellSection
        ref={writeSectionRef}
        title="書込内容"
        description="text / url / json レコードを追加・編集してからタグへ書き込みます。下書きは端末内に保存されます。"
      >
        <WriteDraftPanel
          records={records}
          writePhase={writePhase}
          writeErrorMessage={writeErrorMessage}
          onAppend={appendRecord}
          onUpdate={(next) => updateRecord(next.id, { kind: next.kind, value: next.value })}
          onRemove={removeRecord}
          onClearAll={() => {
            const confirmed = window.confirm(
              "書込内容の下書きをすべて削除します。よろしいですか？"
            );
            if (confirmed) {
              replaceRecords([]);
            }
          }}
        />
      </ShellSection>

      <ShellSection
        title="履歴"
        description="最近の読取・書込結果がここに残ります（最大 100 件・端末内のみ）。"
      >
        <HistoryPanel
          entries={entries}
          onPreview={previewHistoryEntry}
          onWriteThis={(entry) => {
            applyWriteThis(historyRecordsToWriteDraft(entry.records));
          }}
          onRemove={(entry) => {
            const confirmed = window.confirm("この履歴を削除します。よろしいですか？");
            if (confirmed) {
              removeEntry(entry.id);
            }
          }}
          onClear={() => {
            const confirmed = window.confirm("履歴をすべて削除します。よろしいですか？");
            if (confirmed) {
              clearEntries();
            }
          }}
        />
      </ShellSection>
    </div>
  );
}

"use client";

import { clsx } from "clsx";

import { ActionBar } from "@/features/app-shell/components/action-bar";
import { NfcSupportBanner } from "@/features/app-shell/components/nfc-support-banner";
import { ShellSection } from "@/features/app-shell/components/shell-section";
import { useNfcSupport } from "@/features/app-shell/hooks/use-nfc-support";
import { ReadResultPanel } from "@/features/nfc-read/components/read-result-panel";
import { useNfcScan } from "@/features/nfc-read/hooks/use-nfc-scan";
import { WriteDraftPanel } from "@/features/nfc-write/components/write-draft-panel";
import { useNfcWrite } from "@/features/nfc-write/hooks/use-nfc-write";
import { useWriteDraft } from "@/features/nfc-write/hooks/use-write-draft";
import { validateWriteDraft } from "@/lib/nfc/build-ndef-message";

/**
 * Web NFC ツール本体のシェル。
 * 対応判定・読取・書込を担当し、履歴の本実装は後続 Issue に委ねる。
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
  } = useNfcScan();
  const {
    phase: writePhase,
    errorMessage: writeErrorMessage,
    isSessionActive: isWriteSessionActive,
    startWrite,
    cancelWrite,
  } = useNfcWrite();
  const { records, appendRecord, updateRecord, removeRecord } = useWriteDraft();

  const unsupported = support.kind !== "supported";
  const isScanning = phase === "scanning";
  const isWriting = writePhase === "writing";
  const nfcLocked = isScanSessionActive || isWriteSessionActive;
  const canWrite = !unsupported && validateWriteDraft(records) === null;

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
        <ActionBar
          disabled={unsupported}
          isScanning={isScanning}
          isWriting={isWriting}
          nfcLocked={nfcLocked}
          canWrite={canWrite}
          onScan={
            unsupported
              ? undefined
              : () => {
                  cancelWrite();
                  void startScan();
                }
          }
          onCancelScan={cancelScan}
          onWrite={
            unsupported
              ? undefined
              : () => {
                  cancelScan();
                  void startWrite(records);
                }
          }
          onCancelWrite={cancelWrite}
        />
      </header>

      <ShellSection title="いまの結果" description="スキャンしたタグの内容がここに表示されます。">
        <ReadResultPanel
          key={phase === "success" && result ? result.readAt : phase}
          phase={phase}
          result={result}
          errorMessage={errorMessage}
        />
      </ShellSection>

      <ShellSection
        title="書込内容"
        description="text / url / json レコードを追加・編集してからタグへ書き込みます。"
      >
        <WriteDraftPanel
          records={records}
          writePhase={writePhase}
          writeErrorMessage={writeErrorMessage}
          onAppend={appendRecord}
          onUpdate={(next) => updateRecord(next.id, { kind: next.kind, value: next.value })}
          onRemove={removeRecord}
        />
      </ShellSection>

      <ShellSection title="履歴" description="最近の読取結果がここに残ります。">
        <PlaceholderBox>履歴はまだありません</PlaceholderBox>
      </ShellSection>
    </div>
  );
}

type PlaceholderBoxProps = {
  children: string;
};

/**
 * 後続実装までのプレースホルダ表示。
 */
function PlaceholderBox({ children }: PlaceholderBoxProps) {
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

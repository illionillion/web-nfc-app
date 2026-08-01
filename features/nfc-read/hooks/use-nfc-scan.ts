"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { NfcReadResult } from "@/features/nfc-read/types";
import { parseNdefRecords } from "@/lib/nfc/parse-records";
import { isNdefReaderAvailable } from "@/lib/nfc/support";

/**
 * スキャン処理のフェーズ。
 */
export type NfcScanPhase = "idle" | "scanning" | "success" | "error" | "cancelled";

type UseNfcScanResult = {
  phase: NfcScanPhase;
  result: NfcReadResult | null;
  errorMessage: string | null;
  /** scan() の promise が終わるまで true（成功直後の書込重なり防止） */
  isSessionActive: boolean;
  startScan: () => Promise<void>;
  cancelScan: () => void;
  /** 読取結果とエラーを捨てて未読取の状態へ戻す */
  resetScan: () => void;
};

/**
 * NDEF スキャンの開始・停止と結果保持を行う hook。
 *
 * @returns スキャン状態と操作
 */
export function useNfcScan(): UseNfcScanResult {
  const [phase, setPhase] = useState<NfcScanPhase>("idle");
  const [result, setResult] = useState<NfcReadResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const completedRef = useRef(false);
  const attemptIdRef = useRef(0);

  const cancelScan = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  const resetScan = useCallback(() => {
    // 進行中の scan があっても、abort を cancelled として報告させない
    completedRef.current = true;
    cancelScan();
    setPhase("idle");
    setResult(null);
    setErrorMessage(null);
  }, [cancelScan]);

  const startScan = useCallback(async () => {
    if (!isNdefReaderAvailable()) {
      setPhase("error");
      setErrorMessage("この環境では NDEFReader を利用できません。");
      return;
    }

    cancelScan();
    completedRef.current = false;

    const attemptId = attemptIdRef.current + 1;
    attemptIdRef.current = attemptId;
    const isCurrentAttempt = () => attemptId === attemptIdRef.current;

    const controller = new AbortController();
    abortRef.current = controller;

    setPhase("scanning");
    setErrorMessage(null);
    setIsSessionActive(true);

    try {
      const reader = new NDEFReader();

      reader.addEventListener("readingerror", () => {
        if (controller.signal.aborted || completedRef.current) {
          return;
        }

        completedRef.current = true;
        setPhase("error");
        setErrorMessage("読み取りに失敗しました。タグを近づけてもう一度試してください。");
        cancelScan();
      });

      reader.addEventListener("reading", (event) => {
        if (controller.signal.aborted || completedRef.current) {
          return;
        }

        const readingEvent = event as NDEFReadingEvent;
        const nextResult: NfcReadResult = {
          serialNumber: readingEvent.serialNumber || "",
          records: parseNdefRecords(readingEvent.message.records),
          readAt: new Date().toISOString(),
        };

        completedRef.current = true;
        setResult(nextResult);
        setPhase("success");
        setErrorMessage(null);
        cancelScan();
      });

      await reader.scan({ signal: controller.signal });
    } catch (error) {
      if (!isCurrentAttempt()) {
        return;
      }

      if (controller.signal.aborted) {
        if (!completedRef.current) {
          setPhase("cancelled");
          setErrorMessage(null);
        }
        return;
      }

      setPhase("error");
      setErrorMessage(toScanErrorMessage(error));
      abortRef.current = null;
    } finally {
      if (isCurrentAttempt()) {
        setIsSessionActive(false);
      }
    }
  }, [cancelScan]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      abortRef.current = null;
    };
  }, []);

  return {
    phase,
    result,
    errorMessage,
    isSessionActive,
    startScan,
    cancelScan,
    resetScan,
  };
}

/**
 * スキャン例外をユーザー向け文言へ変換する。
 *
 * @param error - 例外
 * @returns 表示用メッセージ
 */
function toScanErrorMessage(error: unknown): string {
  if (error instanceof DOMException) {
    if (error.name === "NotAllowedError") {
      return "NFC の利用が許可されませんでした。ブラウザの権限設定を確認してください。";
    }
    if (error.name === "NotSupportedError") {
      return "この端末またはブラウザでは NFC 読取に対応していません。";
    }
    return `読み取りに失敗しました（${error.name}）。`;
  }

  if (error instanceof Error) {
    return `読み取りに失敗しました: ${error.message}`;
  }

  return "読み取りに失敗しました。";
}

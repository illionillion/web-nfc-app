"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { NfcWritePhase, WriteDraftRecord } from "@/features/nfc-write/types";
import { buildNdefMessageInit, validateWriteDraft } from "@/lib/nfc/build-ndef-message";
import { isNdefReaderAvailable } from "@/lib/nfc/support";

type UseNfcWriteResult = {
  phase: NfcWritePhase;
  errorMessage: string | null;
  /** write() の promise が終わるまで true */
  isSessionActive: boolean;
  /** 直近の成功でタグへ書いたレコード。下書きの後編集に影響されない */
  writtenRecords: WriteDraftRecord[] | null;
  startWrite: (records: WriteDraftRecord[]) => Promise<void>;
  cancelWrite: () => void;
};

/**
 * NDEF 書込の開始・停止と状態保持を行う hook。
 *
 * @returns 書込状態と操作
 */
export function useNfcWrite(): UseNfcWriteResult {
  const [phase, setPhase] = useState<NfcWritePhase>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [writtenRecords, setWrittenRecords] = useState<WriteDraftRecord[] | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const completedRef = useRef(false);
  const attemptIdRef = useRef(0);

  const cancelWrite = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  const startWrite = useCallback(
    async (records: WriteDraftRecord[]) => {
      if (!isNdefReaderAvailable()) {
        setPhase("error");
        setErrorMessage("この環境では NDEFReader を利用できません。");
        return;
      }

      const issue = validateWriteDraft(records);
      if (issue) {
        setPhase("error");
        setErrorMessage(issue.message);
        return;
      }

      cancelWrite();
      completedRef.current = false;

      const attemptId = attemptIdRef.current + 1;
      attemptIdRef.current = attemptId;

      const controller = new AbortController();
      abortRef.current = controller;

      setPhase("writing");
      setErrorMessage(null);
      setIsSessionActive(true);

      const isCurrentAttempt = () => attemptId === attemptIdRef.current;

      try {
        const reader = new NDEFReader();
        const message = buildNdefMessageInit(records);
        await reader.write(message, {
          overwrite: true,
          signal: controller.signal,
        });

        // write が resolve 済みならタグへの書込は成功している。
        // 直後の cancel で aborted になっても writing のまま固めない。
        if (!isCurrentAttempt() || completedRef.current) {
          return;
        }

        completedRef.current = true;
        setWrittenRecords(records);
        setPhase("success");
        setErrorMessage(null);
        abortRef.current = null;
      } catch (error) {
        // 連続 startWrite で abort された旧試行は、現行の phase を上書きしない
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

        completedRef.current = true;
        setPhase("error");
        setErrorMessage(toWriteErrorMessage(error));
        abortRef.current = null;
      } finally {
        if (isCurrentAttempt()) {
          setIsSessionActive(false);
        }
      }
    },
    [cancelWrite]
  );

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      abortRef.current = null;
    };
  }, []);

  return {
    phase,
    errorMessage,
    isSessionActive,
    writtenRecords,
    startWrite,
    cancelWrite,
  };
}

/**
 * 書込例外をユーザー向け文言へ変換する。
 *
 * @param error - 例外
 * @returns 表示用メッセージ
 */
function toWriteErrorMessage(error: unknown): string {
  if (error instanceof DOMException) {
    if (error.name === "NotAllowedError") {
      return "NFC の利用が許可されませんでした。ブラウザの権限設定を確認してください。";
    }
    if (error.name === "NotSupportedError") {
      return "この端末またはブラウザでは NFC 書込に対応していません。";
    }
    if (error.name === "NetworkError") {
      return "書き込みに失敗しました。タグを近づけてもう一度試してください。";
    }
    return `書き込みに失敗しました（${error.name}）。`;
  }

  if (error instanceof Error) {
    return `書き込みに失敗しました: ${error.message}`;
  }

  return "書き込みに失敗しました。";
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { NfcWritePhase } from "@/features/nfc-write/types";
import { isNdefReaderAvailable } from "@/lib/nfc/support";

type UseNfcEraseResult = {
  phase: NfcWritePhase;
  errorMessage: string | null;
  isSessionActive: boolean;
  startErase: () => Promise<void>;
  cancelErase: () => void;
};

/**
 * 空 NDEF メッセージによるタグ消去 hook。
 *
 * @returns 消去状態と操作
 */
export function useNfcErase(): UseNfcEraseResult {
  const [phase, setPhase] = useState<NfcWritePhase>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const completedRef = useRef(false);
  const attemptIdRef = useRef(0);

  const cancelErase = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  const startErase = useCallback(async () => {
    if (!isNdefReaderAvailable()) {
      setPhase("error");
      setErrorMessage("この環境では NDEFReader を利用できません。");
      return;
    }

    cancelErase();
    completedRef.current = false;

    const attemptId = attemptIdRef.current + 1;
    attemptIdRef.current = attemptId;
    const isCurrentAttempt = () => attemptId === attemptIdRef.current;

    const controller = new AbortController();
    abortRef.current = controller;

    setPhase("writing");
    setErrorMessage(null);
    setIsSessionActive(true);

    try {
      const reader = new NDEFReader();
      await reader.write(
        { records: [] },
        {
          overwrite: true,
          signal: controller.signal,
        }
      );

      if (!isCurrentAttempt() || completedRef.current) {
        return;
      }

      completedRef.current = true;
      setPhase("success");
      setErrorMessage(null);
      abortRef.current = null;
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

      completedRef.current = true;
      setPhase("error");
      setErrorMessage(toEraseErrorMessage(error));
      abortRef.current = null;
    } finally {
      if (isCurrentAttempt()) {
        setIsSessionActive(false);
      }
    }
  }, [cancelErase]);

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
    startErase,
    cancelErase,
  };
}

/**
 * 消去例外をユーザー向け文言へ変換する。
 *
 * @param error - 例外
 * @returns 表示用メッセージ
 */
function toEraseErrorMessage(error: unknown): string {
  if (error instanceof DOMException) {
    if (error.name === "NotAllowedError") {
      return "NFC の利用が許可されませんでした。ブラウザの権限設定を確認してください。";
    }
    if (error.name === "NotSupportedError") {
      return "この端末またはブラウザでは NFC 消去に対応していません。";
    }
    if (error.name === "NetworkError") {
      return "消去に失敗しました。タグを近づけてもう一度試してください。";
    }
    return `消去に失敗しました（${error.name}）。`;
  }

  if (error instanceof Error) {
    return `消去に失敗しました: ${error.message}`;
  }

  return "消去に失敗しました。";
}

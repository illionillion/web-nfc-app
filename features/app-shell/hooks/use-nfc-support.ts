"use client";

import { useSyncExternalStore } from "react";

import {
  getNfcSupportStatus,
  NFC_SUPPORT_CHECKING,
  type NfcSupportStatus,
} from "@/lib/nfc/support";

/**
 * クライアント側の Web NFC 対応状況を購読する。
 * SSR 時は `checking`、マウント後に実環境の判定結果へ切り替わる。
 *
 * @returns 現在の対応状況
 */
export function useNfcSupport(): NfcSupportStatus {
  return useSyncExternalStore(subscribeNoop, getNfcSupportStatus, getServerSnapshot);
}

/**
 * 外部ストアはないため購読は no-op。
 * `useSyncExternalStore` の契約を満たすためのダミー。
 */
function subscribeNoop(): () => void {
  return () => {};
}

/**
 * SSR / ハイドレーション前のスナップショット（定数参照）。
 */
function getServerSnapshot(): NfcSupportStatus {
  return NFC_SUPPORT_CHECKING;
}

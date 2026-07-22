/**
 * Web NFC（NDEFReader）の対応状況。
 */
export type NfcSupportStatus =
  | { kind: "checking" }
  | { kind: "unsupported"; reason: "no-ndef-reader" | "insecure-context" }
  | { kind: "supported" };

/** SSR / 判定前。参照を安定させ `useSyncExternalStore` の再レンダーループを防ぐ。 */
export const NFC_SUPPORT_CHECKING = { kind: "checking" } as const satisfies NfcSupportStatus;

/** Secure Context 以外。 */
export const NFC_SUPPORT_INSECURE = {
  kind: "unsupported",
  reason: "insecure-context",
} as const satisfies NfcSupportStatus;

/** NDEFReader 非対応。 */
export const NFC_SUPPORT_NO_READER = {
  kind: "unsupported",
  reason: "no-ndef-reader",
} as const satisfies NfcSupportStatus;

/** Web NFC 対応。 */
export const NFC_SUPPORT_SUPPORTED = { kind: "supported" } as const satisfies NfcSupportStatus;

/**
 * 実行環境が Web NFC 読取に対応しているかを判定する。
 * Client でのみ呼び出すこと（`window` を参照する）。
 *
 * @returns 対応していれば `true`
 */
export function isNdefReaderAvailable(): boolean {
  return typeof window !== "undefined" && "NDEFReader" in window;
}

/**
 * Secure Context（HTTPS / localhost）かどうかを判定する。
 *
 * @returns Secure Context なら `true`
 */
export function isSecureContextAvailable(): boolean {
  return typeof window !== "undefined" && window.isSecureContext === true;
}

/**
 * Web NFC の対応状況をまとめて返す。
 * 非対応時は案内文言の出し分けに使える reason を付ける。
 * 戻り値は定数参照のため、同一状況なら参照が変わらない。
 *
 * @returns 対応状況
 */
export function getNfcSupportStatus(): NfcSupportStatus {
  if (typeof window === "undefined") {
    return NFC_SUPPORT_CHECKING;
  }

  if (!isSecureContextAvailable()) {
    return NFC_SUPPORT_INSECURE;
  }

  if (!isNdefReaderAvailable()) {
    return NFC_SUPPORT_NO_READER;
  }

  return NFC_SUPPORT_SUPPORTED;
}

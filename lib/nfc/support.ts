/**
 * Web NFC（NDEFReader）の対応状況。
 */
export type NfcSupportStatus =
  | { kind: "checking" }
  | { kind: "unsupported"; reason: "no-ndef-reader" | "insecure-context" }
  | { kind: "supported" };

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
  return typeof window !== "undefined" && window.isSecureContext;
}

/**
 * Web NFC の対応状況をまとめて返す。
 * 非対応時は案内文言の出し分けに使える reason を付ける。
 *
 * @returns 対応状況
 */
export function getNfcSupportStatus(): NfcSupportStatus {
  if (typeof window === "undefined") {
    return { kind: "checking" };
  }

  if (!isSecureContextAvailable()) {
    return { kind: "unsupported", reason: "insecure-context" };
  }

  if (!isNdefReaderAvailable()) {
    return { kind: "unsupported", reason: "no-ndef-reader" };
  }

  return { kind: "supported" };
}

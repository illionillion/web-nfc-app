/**
 * Web NFC（NDEF）の最小型定義。
 * ブラウザ実装差があるため、本 Issue では NDEFReader の存在判定に必要な範囲のみ定義する。
 *
 * @see https://w3c.github.io/web-nfc/
 */
declare class NDEFReader extends EventTarget {
  constructor();
  scan(options?: { signal?: AbortSignal }): Promise<void>;
  write(message: unknown, options?: { overwrite?: boolean; signal?: AbortSignal }): Promise<void>;
}

interface Window {
  NDEFReader: typeof NDEFReader;
}

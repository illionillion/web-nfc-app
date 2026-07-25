/**
 * Web NFC（NDEF）の型定義。
 * 読取・書込に必要な範囲を定義する。
 *
 * @see https://w3c.github.io/web-nfc/
 */

declare class NDEFMessage {
  constructor(messageInit: NDEFMessageInit);
  readonly records: ReadonlyArray<NDEFRecord>;
}

declare interface NDEFMessageInit {
  records: NDEFRecordInit[];
}

declare type NDEFRecordDataSource = string | BufferSource | NDEFMessageInit;

declare class NDEFRecord {
  constructor(recordInit: NDEFRecordInit);
  readonly recordType: string;
  readonly mediaType?: string;
  readonly id?: string;
  readonly data?: DataView;
  readonly encoding?: string;
  readonly lang?: string;
  toRecords?: () => NDEFRecord[];
}

declare interface NDEFRecordInit {
  recordType: string;
  mediaType?: string;
  id?: string;
  encoding?: string;
  lang?: string;
  data?: NDEFRecordDataSource;
}

declare class NDEFReader extends EventTarget {
  constructor();
  onreading: ((this: this, event: NDEFReadingEvent) => void) | null;
  onreadingerror: ((this: this, error: Event) => void) | null;
  scan(options?: { signal?: AbortSignal }): Promise<void>;
  write(
    message: string | BufferSource | NDEFMessageInit,
    options?: { overwrite?: boolean; signal?: AbortSignal }
  ): Promise<void>;
}

declare class NDEFReadingEvent extends Event {
  constructor(type: string, eventInitDict: NDEFReadingEventInit);
  readonly serialNumber: string;
  readonly message: NDEFMessage;
}

declare interface NDEFReadingEventInit extends EventInit {
  serialNumber?: string;
  message: NDEFMessageInit;
}

interface Window {
  NDEFReader: typeof NDEFReader;
  NDEFReadingEvent: typeof NDEFReadingEvent;
}

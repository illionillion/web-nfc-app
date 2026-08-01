import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useNfcScan } from "@/features/nfc-read/hooks/use-nfc-scan";

vi.mock("@/lib/nfc/support", () => ({
  isNdefReaderAvailable: vi.fn(() => true),
}));

import { isNdefReaderAvailable } from "@/lib/nfc/support";

/**
 * 文字列から DataView を作る。
 *
 * @param value - 文字列
 * @returns DataView
 */
function toDataView(value: string): DataView {
  const bytes = new TextEncoder().encode(value);
  return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
}

class MockNDEFReader extends EventTarget {
  scan = vi.fn((options?: { signal?: AbortSignal }) => {
    return new Promise<void>((_resolve, reject) => {
      const signal = options?.signal;
      if (signal?.aborted) {
        reject(new DOMException("Aborted", "AbortError"));
        return;
      }

      const onAbort = () => {
        reject(new DOMException("Aborted", "AbortError"));
      };
      signal?.addEventListener("abort", onAbort, { once: true });
    });
  });
}

const readers: MockNDEFReader[] = [];

describe("useNfcScan", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    readers.length = 0;
    vi.mocked(isNdefReaderAvailable).mockReturnValue(true);

    vi.stubGlobal(
      "NDEFReader",
      class {
        constructor() {
          const reader = new MockNDEFReader();
          readers.push(reader);
          return reader;
        }
      }
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("非対応環境では error になる", async () => {
    vi.mocked(isNdefReaderAvailable).mockReturnValue(false);
    const { result } = renderHook(() => useNfcScan());

    await act(async () => {
      await result.current.startScan();
    });

    expect(result.current.phase).toBe("error");
    expect(result.current.errorMessage).toContain("NDEFReader");
  });

  it("reading で success になり結果を保持する", async () => {
    const { result } = renderHook(() => useNfcScan());

    await act(async () => {
      void result.current.startScan();
    });

    await waitFor(() => {
      expect(result.current.phase).toBe("scanning");
      expect(readers).toHaveLength(1);
    });

    const readingEvent = new Event("reading");
    Object.assign(readingEvent, {
      serialNumber: "11:22:33",
      message: {
        records: [
          {
            recordType: "text",
            data: toDataView("nfc-ok"),
          },
        ],
      },
    });

    await act(async () => {
      readers[0]?.dispatchEvent(readingEvent);
    });

    await waitFor(() => {
      expect(result.current.phase).toBe("success");
    });

    expect(result.current.result?.serialNumber).toBe("11:22:33");
    expect(result.current.result?.records[0]?.text).toBe("nfc-ok");
    expect(result.current.isSessionActive).toBe(false);
  });

  it("キャンセルすると cancelled になる", async () => {
    const { result } = renderHook(() => useNfcScan());

    await act(async () => {
      void result.current.startScan();
    });

    await waitFor(() => {
      expect(result.current.phase).toBe("scanning");
    });

    await act(async () => {
      result.current.cancelScan();
    });

    await waitFor(() => {
      expect(result.current.phase).toBe("cancelled");
    });
  });

  it("abort 後の reading は success に上書きしない", async () => {
    const { result } = renderHook(() => useNfcScan());

    await act(async () => {
      void result.current.startScan();
    });

    await waitFor(() => {
      expect(readers).toHaveLength(1);
    });

    await act(async () => {
      result.current.cancelScan();
    });

    await waitFor(() => {
      expect(result.current.phase).toBe("cancelled");
    });

    const readingEvent = new Event("reading");
    Object.assign(readingEvent, {
      serialNumber: "late",
      message: {
        records: [
          {
            recordType: "text",
            data: toDataView("late"),
          },
        ],
      },
    });

    await act(async () => {
      readers[0]?.dispatchEvent(readingEvent);
    });

    expect(result.current.phase).toBe("cancelled");
    expect(result.current.result).toBeNull();
  });

  it("resetScan で結果を捨てて idle に戻る", async () => {
    const { result } = renderHook(() => useNfcScan());

    await act(async () => {
      void result.current.startScan();
    });

    await waitFor(() => {
      expect(readers).toHaveLength(1);
    });

    const readingEvent = new Event("reading");
    Object.assign(readingEvent, {
      serialNumber: "44:55",
      message: {
        records: [
          {
            recordType: "text",
            data: toDataView("reset-me"),
          },
        ],
      },
    });

    await act(async () => {
      readers[0]?.dispatchEvent(readingEvent);
    });

    await waitFor(() => {
      expect(result.current.phase).toBe("success");
    });

    await act(async () => {
      result.current.resetScan();
    });

    expect(result.current.phase).toBe("idle");
    expect(result.current.result).toBeNull();
    expect(result.current.errorMessage).toBeNull();
  });

  it("スキャン中に resetScan しても cancelled にならない", async () => {
    const { result } = renderHook(() => useNfcScan());

    await act(async () => {
      void result.current.startScan();
    });

    await waitFor(() => {
      expect(result.current.phase).toBe("scanning");
    });

    await act(async () => {
      result.current.resetScan();
    });

    await waitFor(() => {
      expect(result.current.isSessionActive).toBe(false);
    });

    expect(result.current.phase).toBe("idle");
  });

  it("readingerror で error になる", async () => {
    const { result } = renderHook(() => useNfcScan());

    await act(async () => {
      void result.current.startScan();
    });

    await waitFor(() => {
      expect(readers).toHaveLength(1);
    });

    await act(async () => {
      readers[0]?.dispatchEvent(new Event("readingerror"));
    });

    await waitFor(() => {
      expect(result.current.phase).toBe("error");
    });

    expect(result.current.errorMessage).toContain("読み取りに失敗");
  });
});

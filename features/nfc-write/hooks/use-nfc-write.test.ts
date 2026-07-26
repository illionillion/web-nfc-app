import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useNfcWrite } from "@/features/nfc-write/hooks/use-nfc-write";
import type { WriteDraftRecord } from "@/features/nfc-write/types";

vi.mock("@/lib/nfc/support", () => ({
  isNdefReaderAvailable: vi.fn(() => true),
}));

import { isNdefReaderAvailable } from "@/lib/nfc/support";

type WriteCall = {
  message: NDEFMessageInit;
  options?: { overwrite?: boolean; signal?: AbortSignal };
  resolve: () => void;
  reject: (error: unknown) => void;
};

const writeCalls: WriteCall[] = [];

class MockNDEFReader {
  write = vi.fn(
    (message: NDEFMessageInit, options?: { overwrite?: boolean; signal?: AbortSignal }) => {
      return new Promise<void>((resolve, reject) => {
        const signal = options?.signal;
        if (signal?.aborted) {
          reject(new DOMException("Aborted", "AbortError"));
          return;
        }

        const call: WriteCall = {
          message,
          options,
          resolve: () => resolve(),
          reject: (error: unknown) => reject(error),
        };
        writeCalls.push(call);

        const onAbort = () => {
          reject(new DOMException("Aborted", "AbortError"));
        };
        signal?.addEventListener("abort", onAbort, { once: true });
      });
    }
  );
}

const sampleRecords: WriteDraftRecord[] = [
  {
    id: "r1",
    kind: "text",
    value: "hello",
  },
];

describe("useNfcWrite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    writeCalls.length = 0;
    vi.mocked(isNdefReaderAvailable).mockReturnValue(true);

    vi.stubGlobal(
      "NDEFReader",
      class {
        constructor() {
          return new MockNDEFReader();
        }
      }
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("非対応環境では error になる", async () => {
    vi.mocked(isNdefReaderAvailable).mockReturnValue(false);
    const { result } = renderHook(() => useNfcWrite());

    await act(async () => {
      await result.current.startWrite(sampleRecords);
    });

    expect(result.current.phase).toBe("error");
    expect(result.current.errorMessage).toContain("NDEFReader");
    expect(writeCalls).toHaveLength(0);
  });

  it("不正な下書きでは write せず error になる", async () => {
    const { result } = renderHook(() => useNfcWrite());

    await act(async () => {
      await result.current.startWrite([]);
    });

    expect(result.current.phase).toBe("error");
    expect(result.current.errorMessage).toContain("レコードを追加");
    expect(writeCalls).toHaveLength(0);
  });

  it("write 成功で success になる", async () => {
    const { result } = renderHook(() => useNfcWrite());

    await act(async () => {
      void result.current.startWrite(sampleRecords);
    });

    await waitFor(() => {
      expect(result.current.phase).toBe("writing");
      expect(writeCalls).toHaveLength(1);
    });

    await act(async () => {
      writeCalls[0]?.resolve();
    });

    await waitFor(() => {
      expect(result.current.phase).toBe("success");
    });

    expect(result.current.isSessionActive).toBe(false);
    expect(result.current.errorMessage).toBeNull();
  });

  it("write 失敗で error になる", async () => {
    const { result } = renderHook(() => useNfcWrite());

    await act(async () => {
      void result.current.startWrite(sampleRecords);
    });

    await waitFor(() => {
      expect(writeCalls).toHaveLength(1);
    });

    await act(async () => {
      writeCalls[0]?.reject(new DOMException("network", "NetworkError"));
    });

    await waitFor(() => {
      expect(result.current.phase).toBe("error");
    });

    expect(result.current.errorMessage).toContain("書き込みに失敗しました");
  });

  it("キャンセルすると cancelled になる", async () => {
    const { result } = renderHook(() => useNfcWrite());

    await act(async () => {
      void result.current.startWrite(sampleRecords);
    });

    await waitFor(() => {
      expect(result.current.phase).toBe("writing");
    });

    await act(async () => {
      result.current.cancelWrite();
    });

    await waitFor(() => {
      expect(result.current.phase).toBe("cancelled");
    });

    expect(result.current.errorMessage).toBeNull();
  });

  it("連続 startWrite で旧試行の abort は現行 phase を上書きしない", async () => {
    const { result } = renderHook(() => useNfcWrite());

    await act(async () => {
      void result.current.startWrite(sampleRecords);
    });

    await waitFor(() => {
      expect(writeCalls).toHaveLength(1);
    });

    await act(async () => {
      void result.current.startWrite([{ id: "r2", kind: "text", value: "second" }]);
    });

    await waitFor(() => {
      expect(writeCalls).toHaveLength(2);
      expect(result.current.phase).toBe("writing");
    });

    await act(async () => {
      writeCalls[1]?.resolve();
    });

    await waitFor(() => {
      expect(result.current.phase).toBe("success");
    });

    expect(result.current.errorMessage).toBeNull();
  });

  it("write resolve 後の cancel でも success のまま", async () => {
    const { result } = renderHook(() => useNfcWrite());

    await act(async () => {
      void result.current.startWrite(sampleRecords);
    });

    await waitFor(() => {
      expect(writeCalls).toHaveLength(1);
    });

    await act(async () => {
      writeCalls[0]?.resolve();
    });

    await waitFor(() => {
      expect(result.current.phase).toBe("success");
    });

    await act(async () => {
      result.current.cancelWrite();
    });

    expect(result.current.phase).toBe("success");
  });
});

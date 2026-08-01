import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useNfcErase } from "@/features/nfc-write/hooks/use-nfc-erase";

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

describe("useNfcErase", () => {
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
    const { result } = renderHook(() => useNfcErase());

    await act(async () => {
      await result.current.startErase();
    });

    expect(result.current.phase).toBe("error");
    expect(result.current.errorMessage).toContain("NDEFReader");
    expect(writeCalls).toHaveLength(0);
  });

  it("空レコード 1 件で上書きして success になる", async () => {
    const { result } = renderHook(() => useNfcErase());

    await act(async () => {
      void result.current.startErase();
    });

    await waitFor(() => {
      expect(result.current.phase).toBe("writing");
      expect(writeCalls).toHaveLength(1);
    });

    expect(writeCalls[0]?.message).toEqual({ records: [{ recordType: "empty" }] });
    expect(writeCalls[0]?.options?.overwrite).toBe(true);

    await act(async () => {
      writeCalls[0]?.resolve();
    });

    await waitFor(() => {
      expect(result.current.phase).toBe("success");
    });

    expect(result.current.isSessionActive).toBe(false);
  });

  it("キャンセルすると cancelled になる", async () => {
    const { result } = renderHook(() => useNfcErase());

    await act(async () => {
      void result.current.startErase();
    });

    await waitFor(() => {
      expect(result.current.phase).toBe("writing");
    });

    await act(async () => {
      result.current.cancelErase();
    });

    await waitFor(() => {
      expect(result.current.phase).toBe("cancelled");
    });
  });
});

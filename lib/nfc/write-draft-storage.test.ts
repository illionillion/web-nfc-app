import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { WriteDraftRecord } from "@/features/nfc-write/types";
import {
  WRITE_DRAFT_STORAGE_KEY,
  loadWriteDraftRecords,
  saveWriteDraftRecords,
} from "@/lib/nfc/write-draft-storage";

const sample: WriteDraftRecord[] = [
  { id: "a", kind: "text", value: "hello" },
  { id: "b", kind: "url", value: "https://example.com" },
];

describe("write-draft-storage", () => {
  beforeEach(() => {
    const store = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
      removeItem: (key: string) => {
        store.delete(key);
      },
      clear: () => {
        store.clear();
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("空のときは空配列", () => {
    expect(loadWriteDraftRecords()).toEqual([]);
  });

  it("保存した下書きを読み戻せる", () => {
    saveWriteDraftRecords(sample);
    expect(loadWriteDraftRecords()).toEqual(sample);
    expect(localStorage.getItem(WRITE_DRAFT_STORAGE_KEY)).toContain("hello");
  });

  it("保存が例外を投げても呼び出し元へ伝播しない", () => {
    vi.stubGlobal("localStorage", {
      getItem: () => null,
      setItem: () => {
        throw new DOMException("quota", "QuotaExceededError");
      },
      removeItem: () => {},
      clear: () => {},
    });

    expect(() => saveWriteDraftRecords(sample)).not.toThrow();
  });

  it("不正な要素は除外する", () => {
    localStorage.setItem(
      WRITE_DRAFT_STORAGE_KEY,
      JSON.stringify([sample[0], { id: 1, kind: "text", value: "bad" }, sample[1]])
    );
    expect(loadWriteDraftRecords()).toEqual([sample[0], sample[1]]);
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { HistoryEntry } from "@/features/history/types";
import {
  HISTORY_MAX_ITEMS,
  HISTORY_STORAGE_KEY,
  loadHistoryEntries,
  prependHistoryEntry,
  saveHistoryEntries,
} from "@/lib/history/storage";

function sampleEntry(id: string): HistoryEntry {
  return {
    id,
    source: "read",
    createdAt: "2026-01-01T00:00:00.000Z",
    serialNumber: "sn",
    records: [{ kind: "text", recordType: "text", text: "hello" }],
  };
}

describe("history storage", () => {
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

  it("空のときは空配列を返す", () => {
    expect(loadHistoryEntries()).toEqual([]);
  });

  it("保存した履歴を読み戻せる", () => {
    const entries = [sampleEntry("a"), sampleEntry("b")];
    saveHistoryEntries(entries);
    expect(loadHistoryEntries()).toEqual(entries);
    expect(localStorage.getItem(HISTORY_STORAGE_KEY)).toContain('"a"');
  });

  it("最大件数を超えると古いものから落とす", () => {
    const many = Array.from({ length: HISTORY_MAX_ITEMS + 5 }, (_, index) =>
      sampleEntry(`id-${index}`)
    );
    saveHistoryEntries(many);
    const loaded = loadHistoryEntries();
    expect(loaded).toHaveLength(HISTORY_MAX_ITEMS);
    expect(loaded[0]?.id).toBe("id-0");
    expect(loaded.at(-1)?.id).toBe(`id-${HISTORY_MAX_ITEMS - 1}`);
  });

  it("prepend は先頭追加し上限で切り詰める", () => {
    const base = Array.from({ length: HISTORY_MAX_ITEMS }, (_, index) =>
      sampleEntry(`old-${index}`)
    );
    const next = prependHistoryEntry(base, sampleEntry("newest"));
    expect(next).toHaveLength(HISTORY_MAX_ITEMS);
    expect(next[0]?.id).toBe("newest");
    expect(next.at(-1)?.id).toBe(`old-${HISTORY_MAX_ITEMS - 2}`);
  });

  it("壊れた JSON は空配列になる", () => {
    localStorage.setItem(HISTORY_STORAGE_KEY, "{not-json");
    expect(loadHistoryEntries()).toEqual([]);
  });
});

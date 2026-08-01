"use client";

import { useCallback, useRef, useSyncExternalStore } from "react";

import type { HistoryEntry, HistoryRecord, HistorySource } from "@/features/history/types";
import { loadHistoryEntries, prependHistoryEntry, saveHistoryEntries } from "@/lib/history/storage";

type UseNfcHistoryResult = {
  entries: HistoryEntry[];
  addEntry: (input: {
    source: HistorySource;
    serialNumber?: string;
    records: HistoryRecord[];
  }) => void;
  removeEntry: (id: string) => void;
  clearEntries: () => void;
};

const EMPTY_ENTRIES: HistoryEntry[] = [];

/**
 * 読取・書込履歴の保持と localStorage 同期。
 *
 * @returns 履歴状態と操作
 */
export function useNfcHistory(): UseNfcHistoryResult {
  const cacheRef = useRef<HistoryEntry[] | null>(null);
  const listenersRef = useRef(new Set<() => void>());

  const getSnapshot = useCallback(() => {
    if (cacheRef.current === null) {
      cacheRef.current = loadHistoryEntries();
    }
    return cacheRef.current;
  }, []);

  const subscribe = useCallback((listener: () => void) => {
    listenersRef.current.add(listener);
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  const entries = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY_ENTRIES);

  /**
   * キャッシュを更新して購読者へ通知する。
   *
   * @param next - 次の履歴
   */
  const commit = useCallback((next: HistoryEntry[]) => {
    saveHistoryEntries(next);
    cacheRef.current = next;
    for (const listener of listenersRef.current) {
      listener();
    }
  }, []);

  const addEntry = useCallback(
    (input: { source: HistorySource; serialNumber?: string; records: HistoryRecord[] }) => {
      const entry: HistoryEntry = {
        id: createHistoryId(),
        source: input.source,
        createdAt: new Date().toISOString(),
        serialNumber: input.serialNumber ?? "",
        records: input.records,
      };
      const current = cacheRef.current ?? loadHistoryEntries();
      commit(prependHistoryEntry(current, entry));
    },
    [commit]
  );

  const removeEntry = useCallback(
    (id: string) => {
      const current = cacheRef.current ?? loadHistoryEntries();
      commit(current.filter((entry) => entry.id !== id));
    },
    [commit]
  );

  const clearEntries = useCallback(() => {
    commit([]);
  }, [commit]);

  return {
    entries,
    addEntry,
    removeEntry,
    clearEntries,
  };
}

/**
 * 履歴エントリ ID を生成する。
 *
 * @returns ID
 */
function createHistoryId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `history-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

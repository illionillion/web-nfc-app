"use client";

import { useCallback, useRef, useSyncExternalStore } from "react";

import type { WriteDraftRecord } from "@/features/nfc-write/types";
import { loadWriteDraftRecords, saveWriteDraftRecords } from "@/lib/nfc/write-draft-storage";

type UseWriteDraftResult = {
  records: WriteDraftRecord[];
  /** 保存確定したレコードを一覧へ追加する */
  appendRecord: (record: WriteDraftRecord) => void;
  updateRecord: (id: string, patch: Partial<Pick<WriteDraftRecord, "value" | "kind">>) => void;
  removeRecord: (id: string) => void;
  replaceRecords: (next: WriteDraftRecord[]) => void;
};

const EMPTY_RECORDS: WriteDraftRecord[] = [];

/**
 * 書込下書きの CRUD（localStorage 永続化付き）。
 *
 * @returns 下書き状態と操作
 */
export function useWriteDraft(): UseWriteDraftResult {
  const cacheRef = useRef<WriteDraftRecord[] | null>(null);
  const listenersRef = useRef(new Set<() => void>());

  const getSnapshot = useCallback(() => {
    if (cacheRef.current === null) {
      cacheRef.current = loadWriteDraftRecords();
    }
    return cacheRef.current;
  }, []);

  const subscribe = useCallback((listener: () => void) => {
    listenersRef.current.add(listener);
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  const records = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY_RECORDS);

  /**
   * キャッシュを更新して購読者へ通知する。
   *
   * @param next - 次の下書き
   */
  const commit = useCallback((next: WriteDraftRecord[]) => {
    saveWriteDraftRecords(next);
    cacheRef.current = next;
    for (const listener of listenersRef.current) {
      listener();
    }
  }, []);

  const appendRecord = useCallback(
    (record: WriteDraftRecord) => {
      const current = cacheRef.current ?? loadWriteDraftRecords();
      commit([...current, record]);
    },
    [commit]
  );

  const updateRecord = useCallback(
    (id: string, patch: Partial<Pick<WriteDraftRecord, "value" | "kind">>) => {
      const current = cacheRef.current ?? loadWriteDraftRecords();
      commit(current.map((record) => (record.id === id ? { ...record, ...patch } : record)));
    },
    [commit]
  );

  const removeRecord = useCallback(
    (id: string) => {
      const current = cacheRef.current ?? loadWriteDraftRecords();
      commit(current.filter((record) => record.id !== id));
    },
    [commit]
  );

  const replaceRecords = useCallback(
    (next: WriteDraftRecord[]) => {
      commit(next);
    },
    [commit]
  );

  return {
    records,
    appendRecord,
    updateRecord,
    removeRecord,
    replaceRecords,
  };
}

"use client";

import { useCallback, useState } from "react";

import type { WriteDraftRecord } from "@/features/nfc-write/types";

type UseWriteDraftResult = {
  records: WriteDraftRecord[];
  /** 保存確定したレコードを一覧へ追加する */
  appendRecord: (record: WriteDraftRecord) => void;
  updateRecord: (id: string, patch: Partial<Pick<WriteDraftRecord, "value" | "kind">>) => void;
  removeRecord: (id: string) => void;
  replaceRecords: (next: WriteDraftRecord[]) => void;
};

/**
 * 書込下書き（メモリ保持）の CRUD。
 *
 * @returns 下書き状態と操作
 */
export function useWriteDraft(): UseWriteDraftResult {
  const [records, setRecords] = useState<WriteDraftRecord[]>([]);

  const appendRecord = useCallback((record: WriteDraftRecord) => {
    setRecords((current) => [...current, record]);
  }, []);

  const updateRecord = useCallback(
    (id: string, patch: Partial<Pick<WriteDraftRecord, "value" | "kind">>) => {
      setRecords((current) =>
        current.map((record) => (record.id === id ? { ...record, ...patch } : record))
      );
    },
    []
  );

  const removeRecord = useCallback((id: string) => {
    setRecords((current) => current.filter((record) => record.id !== id));
  }, []);

  const replaceRecords = useCallback((next: WriteDraftRecord[]) => {
    setRecords(next);
  }, []);

  return {
    records,
    appendRecord,
    updateRecord,
    removeRecord,
    replaceRecords,
  };
}

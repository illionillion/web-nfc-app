"use client";

import { useCallback, useState } from "react";

import type { WriteDraftRecord, WriteRecordKind } from "@/features/nfc-write/types";
import { defaultValueForKind } from "@/features/nfc-write/lib/draft-defaults";

type UseWriteDraftResult = {
  records: WriteDraftRecord[];
  addRecord: (kind: WriteRecordKind) => WriteDraftRecord;
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

  const addRecord = useCallback((kind: WriteRecordKind) => {
    const next: WriteDraftRecord = {
      id: createDraftId(),
      kind,
      value: defaultValueForKind(kind),
    };
    setRecords((current) => [...current, next]);
    return next;
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
    addRecord,
    updateRecord,
    removeRecord,
    replaceRecords,
  };
}

/**
 * 下書きレコード用の一意 ID を生成する。
 *
 * @returns ID
 */
function createDraftId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `draft-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

"use client";

import { useEffect } from "react";

/**
 * `/sw.js` を登録する。HTTPS / localhost でのみ有効。
 */
export function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    void navigator.serviceWorker.register("/sw.js").catch(() => {
      // 登録失敗は無視（非対応・一時的なネットワーク等）
    });
  }, []);

  return null;
}

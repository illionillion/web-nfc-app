import type { NfcSupportStatus } from "@/lib/nfc/support";
import { clsx } from "clsx";

type NfcSupportBannerProps = {
  status: NfcSupportStatus;
};

/**
 * Web NFC の対応状況と、非対応時の案内を表示する。
 */
export function NfcSupportBanner({ status }: NfcSupportBannerProps) {
  if (status.kind === "checking") {
    return (
      <p className={clsx(["text-sm", "text-muted"])} role="status">
        対応状況を確認しています…
      </p>
    );
  }

  if (status.kind === "supported") {
    return (
      <div className={clsx(["space-y-1"])} role="status">
        <p
          className={clsx(["text-sm", "font-medium", "text-emerald-700", "dark:text-emerald-400"])}
        >
          この端末は Web NFC に対応しています
        </p>
        <p className={clsx(["text-sm", "text-muted"])}>
          待機中 — 下の操作からスキャンや書き込みを始められます（本実装は後続）
        </p>
      </div>
    );
  }

  return (
    <div
      className={clsx([
        "space-y-2",
        "rounded-lg",
        "border",
        "border-amber-300",
        "bg-amber-50",
        "p-4",
        "dark:border-amber-700",
        "dark:bg-amber-950",
      ])}
      role="alert"
    >
      <p className={clsx(["text-sm", "font-medium", "text-amber-900", "dark:text-amber-100"])}>
        この環境では Web NFC を使えません
      </p>
      <ul
        className={clsx([
          "list-disc",
          "space-y-1",
          "pl-5",
          "text-sm",
          "text-amber-900",
          "dark:text-amber-100",
        ])}
      >
        {status.reason === "insecure-context" ? (
          <li>HTTPS（または localhost）の Secure Context が必要です</li>
        ) : (
          <li>
            NDEFReader がありません。Android の Chrome など、Web NFC 対応ブラウザで開いてください
          </li>
        )}
        <li>iOS / 多くのデスクトップブラウザは Web NFC 非対応です</li>
      </ul>
    </div>
  );
}

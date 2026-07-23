import { clsx } from "clsx";

type ActionBarProps = {
  /** 書込・消去を無効化するか（非対応時など） */
  disabled: boolean;
  /** スキャン中か */
  isScanning?: boolean;
  /** スキャン開始 */
  onScan?: () => void;
  /** スキャンキャンセル */
  onCancelScan?: () => void;
};

/**
 * スキャン / 書き込み / 消去の操作ボタン。
 * 書込・消去の本実装は後続 Issue。
 */
export function ActionBar({ disabled, isScanning = false, onScan, onCancelScan }: ActionBarProps) {
  return (
    <div className={clsx(["flex", "flex-wrap", "gap-2"])} role="group" aria-label="NFC 操作">
      {isScanning ? (
        <ActionButton disabled={false} onClick={onCancelScan}>
          キャンセル
        </ActionButton>
      ) : (
        <ActionButton disabled={disabled || !onScan} onClick={onScan}>
          スキャン
        </ActionButton>
      )}
      <ActionButton disabled>書き込む</ActionButton>
      <ActionButton disabled>消去</ActionButton>
    </div>
  );
}

type ActionButtonProps = {
  children: string;
  disabled: boolean;
  onClick?: () => void;
};

/**
 * シェル用の操作ボタン。
 */
function ActionButton({ children, disabled, onClick }: ActionButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={clsx([
        "min-h-11",
        "flex-1",
        "rounded-md",
        "border",
        "border-zinc-300",
        "bg-zinc-900",
        "px-4",
        "py-2",
        "text-sm",
        "font-medium",
        "text-white",
        "disabled:cursor-not-allowed",
        "disabled:opacity-40",
      ])}
    >
      {children}
    </button>
  );
}
